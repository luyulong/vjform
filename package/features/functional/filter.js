import feature from "../../feature";

feature
  .functional("FILTER", (array, filter) => {
    return array.filter(filter);
  })
  .withDescription("集合过滤")
  .withGroup("集合");
