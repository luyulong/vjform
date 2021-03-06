import {
  cloneDeep,
  forEach,
  get,
  isArray,
  isObject,
  isString
} from "lodash-es";
import qs from "querystring";
import parse from "url-parse";
import feature from "../../feature";

const pathTraversal = owner => {
  const result = {};

  const eachPath = (node, path) => {
    if (!isObject(node) && !isArray(node)) {
      let objectPath = "";
      path.forEach(item => {
        objectPath += isString(item) ? `.${item}` : `[${item}]`;
      });
      result[objectPath.substring(1)] = node;
    } else {
      forEach(node, (propValue, key) => {
        const nextpath = cloneDeep(path);
        nextpath.push(key);
        eachPath(propValue, nextpath);
      });
    }
  };

  eachPath(owner, []);

  return result;
};

feature
  .datasource("submit", function(getOptions, context) {
    const { watchs = [], dev } = getOptions();

    const instance = {
      loading: true,
      data: null,
      watchs: []
    };

    const doSubmit = () => {
      if (dev) {
        return;
      }

      instance.loading = true;

      const options = getOptions();

      const parsedUrl = parse(options.url);
      const orgquery =
        parsedUrl.query.indexOf("?") === 0 ? parsedUrl.query.substring(1) : "";

      parsedUrl.set(
        "query",
        qs.stringify(Object.assign({}, qs.parse(orgquery), options.params))
      );

      const dlform = document.createElement("form");
      dlform.style = "display:none;";
      dlform.method = options.method || "POST";
      dlform.action = parsedUrl.href;
      dlform.target = options.target;

      const pathObject = pathTraversal(options.data);

      Object.keys(pathObject).forEach(key => {
        const hdnFilePath = document.createElement("input");
        hdnFilePath.type = "hidden";
        hdnFilePath.name = key;
        hdnFilePath.value = get(options.data, key);
        dlform.appendChild(hdnFilePath);
      });

      const attachElement =
        document.getElementById(options.container) || document.body;
      attachElement.appendChild(dlform);
      dlform.submit();
      attachElement.removeChild(dlform);
    };

    this.$nextTick(() => {
      watchs.forEach(watch => {
        instance.watchs.push(
          this.$watch(
            () => get(context, watch),
            () => doSubmit()
          )
        );
      });
    });

    instance.submit = doSubmit;

    return instance;
  })
  .withName("表单提交")
  .withDescription("数据以html表单形式提交");
