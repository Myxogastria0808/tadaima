import app from 'ags/gtk4/app';
import Greeter from './components/Greeter';

app.start({
  instanceName: 'greeter',
  requestHandler(_, response) {
    response('not implemented');
  },
  main() {
    Greeter();
  },
});
