import app from 'ags/gtk4/app';
import globalCss from './global.css';
import Greeter from './components/Greeter';

app.start({
  css: globalCss,
  instanceName: 'greeter',
  requestHandler(_, response) {
    response('not implemented');
  },
  main() {
    Greeter();
  },
});
