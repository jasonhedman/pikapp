const log = (data) => {
  let component_name = "???";
  if (data.component) {
    component_name = `${data.component}`;
  }

  let method_name = "";
  if (data.method) {
    method_name = `.${data.method}()`;
  }

  console.log(`TRACE: ${component_name}${method_name}: ${data.trace}`);
};

export const trace = (me, trace, method = null) => {
  log({
    component: me.constructor.name,
    method: method,
    trace: trace,
  });
};

export default trace;
