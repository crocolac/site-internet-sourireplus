import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import publish_methode as publisher


class MethodPublicationTests(unittest.TestCase):
    def test_snapshot_requires_every_oauth_and_bridge_file(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)/'public';source=Path(folder)/'source'
            release={'web_version':'0.6.0'}
            for name in publisher.release_files(release):
                for base in (root,source):
                    path=base/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(b'fixture')
            publisher.validate_web_snapshot(root,source,release)
            for name in ('api/3shape/oauth/callback.php','api/3shape/oauth/.htaccess','visite/3shape-bridge.php','visite/3shape-ui.js'):
                with self.subTest(name=name):
                    path=root/name;path.unlink()
                    with self.assertRaises(publisher.updates.PublishError):publisher.validate_web_snapshot(root,source,release)
                    path.write_bytes(b'different')
                    with self.assertRaises(publisher.updates.PublishError):publisher.validate_web_snapshot(root,source,release)
                    path.write_bytes(b'fixture')

    def test_existing_release_keeps_its_original_files(self):
        self.assertEqual(publisher.release_files({'web_version':'0.4.4'}),tuple('visite/'+n for n in publisher.FILES))

    def test_version_does_not_supply_arbitrary_deployment_paths(self):
        for version in ('../0.6.0','0.6.0/extra',None):
            with self.assertRaises(publisher.updates.PublishError):publisher.release_files({'web_version':version})


if __name__=='__main__':unittest.main()
