'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const target = path.resolve(process.env.ACQUISITION_COMPILED_DIR || '.acquisition-test-build', 'acquisition-client.js');
const realNow = Date.now;
let now, calls, storage, idCounter;
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const signature = 'a'.repeat(64);
function load() { delete require.cache[require.resolve(target)]; return require(target); }
function setup() {
  now = 1790000000000; calls = []; storage = new Map(); idCounter = 0;
  Date.now = () => now;
  global.sessionStorage = {getItem:k=>storage.get(k)||null, setItem:(k,v)=>storage.set(k,v), removeItem:k=>storage.delete(k)};
  Object.defineProperty(globalThis, 'crypto', {value:{randomUUID:()=>id(++idCounter)}, configurable:true});
  global.fetch = async (url, options) => {
    const body = JSON.parse(options.body); calls.push({url, options, body});
    return new Response(JSON.stringify(body.action === 'visit'
      ? {ok:true, attribution:{id:body.id, signature, expires_at:Math.floor(now/1000)+1800}} : {ok:true}), {status:200});
  };
  return load();
}
const tests = [];
function test(name, fn) { tests.push([name, fn]); }
test('Only exact paid campaign tagging identifies a ChatGPT ad', async () => {
  const c=setup();
  assert.equal(c.channelFromSearch('?utm_source=chatgpt&utm_medium=cpc&utm_campaign=sourireplus_rdv'), 'chatgpt_ads');
  for(const q of ['', '?utm_source=chatgpt', '?utm_source=chatgpt&utm_medium=referral', '?utm_source=google&utm_medium=cpc']) assert.equal(c.channelFromSearch(q),'other_site');
});
test('No consent and refusal make no measurement request', async () => {
  const c=setup(); await c.recordVisit(); await c.recordFirstAppointmentClick(); assert.equal(await c.getAdAttribution(),undefined);
  c.chooseMeasurement(false,'chatgpt_ads'); await c.recordVisit(); await c.recordFirstAppointmentClick(); assert.equal(calls.length,0);
});
test('Other site visits use the explicit strict server contract', async () => {
  const c=setup(); c.chooseMeasurement(true,'other_site'); await c.recordVisit();
  assert.deepEqual(calls[0].body,{action:'visit',consent:true,campaign:'sourireplus_rdv',channel:'other_site',id:id(1)});
  assert.equal(calls[0].options.credentials,'omit'); assert.equal(calls[0].options.referrerPolicy,'no-referrer');
  assert.equal(calls[0].url,'https://mydentalpass.ch/borne/ads-visit.php');
});
test('Concurrent visits and first clicks are idempotent', async () => {
  const c=setup(); c.chooseMeasurement(true,'chatgpt_ads');
  await Promise.all([c.recordVisit(),c.recordVisit(),c.recordFirstAppointmentClick(),c.recordFirstAppointmentClick()]);
  await c.recordFirstAppointmentClick();
  assert.equal(calls.filter(x=>x.body.action==='visit').length,1);
  assert.equal(calls.filter(x=>x.body.action==='attempt').length,1);
  assert.deepEqual(calls[1].body,{action:'attempt',consent:true,campaign:'sourireplus_rdv',attribution:{id:id(1),signature}});
});
test('Reload retains original channel, token and first click', async () => {
  let c=setup(); c.chooseMeasurement(true,'chatgpt_ads'); await c.recordFirstAppointmentClick();
  c=load(); await c.recordVisit(); await c.recordFirstAppointmentClick();
  assert.equal(calls.length,2); assert.equal(c.readChoice().channel,'chatgpt_ads');
});
test('Reopening consent does not renew the session or visit', async () => {
  const c=setup(); c.chooseMeasurement(true,'other_site'); await c.recordVisit(); const expiry=c.readChoice().until;
  now+=10000; c.chooseMeasurement(true,'chatgpt_ads'); await c.recordVisit();
  assert.equal(c.readChoice().until,expiry); assert.equal(c.readChoice().channel,'other_site'); assert.equal(calls.length,1);
});
test('Expired session requires renewed choice', async () => {
  const c=setup(); c.chooseMeasurement(true,'other_site'); await c.recordVisit(); now+=1800001;
  assert.equal(c.readChoice(),undefined); await c.recordVisit(); await c.recordFirstAppointmentClick(); assert.equal(calls.length,1);
});
test('Refusal removes attribution and blocks future clicks', async () => {
  const c=setup(); c.chooseMeasurement(true,'other_site'); await c.recordVisit(); c.chooseMeasurement(false,'other_site');
  await c.recordFirstAppointmentClick(); assert.equal(await c.getAdAttribution(),undefined); assert.equal(calls.length,1);
  assert.equal(JSON.parse(storage.get(c.MEASUREMENT_KEY)).token,undefined);
});
test('Network failure cannot reject the booking helper', async () => {
  const c=setup(); global.fetch=async()=>{throw new Error('synthetic offline');};
  c.chooseMeasurement(true,'other_site'); assert.equal(await c.getAdAttribution(),undefined); await c.recordFirstAppointmentClick();
});
test('Inaccessible storage still permits one in-memory consented session', async () => {
  const c=setup(); global.sessionStorage={getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}};
  c.chooseMeasurement(true,'other_site'); await c.recordVisit(); await c.recordVisit(); assert.equal(calls.length,1);
});
test('Mismatched server token is never attached to a booking', async () => {
  const c=setup(); global.fetch=async()=>new Response(JSON.stringify({ok:true,attribution:{id:id(99),signature,expires_at:Math.floor(now/1000)+1800}}));
  c.chooseMeasurement(true,'other_site'); assert.equal(await c.getAdAttribution(),undefined);
});
test('Revoked consent cannot be restored by an in-flight response', async () => {
  const c=setup(); let finish;
  global.fetch=()=>new Promise(resolve=>{finish=resolve;});
  c.chooseMeasurement(true,'other_site'); const pending=c.recordVisit(); c.chooseMeasurement(false,'other_site');
  finish(new Response(JSON.stringify({ok:true,attribution:{id:id(1),signature,expires_at:Math.floor(now/1000)+1800}})));
  assert.equal(await pending,undefined); assert.equal(c.readChoice().accepted,false);
});
(async()=>{let passed=0; try { for(const [name,fn] of tests) { await fn(); passed++; console.log('PASS '+name); } console.log(`ACQUISITION_CLIENT_OK ${passed} tests; no real network, storage or patient data.`); }
finally { Date.now=realNow; }})().catch(error=>{console.error(error);process.exitCode=1;});
