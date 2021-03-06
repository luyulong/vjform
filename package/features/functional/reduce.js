import feature from "../../feature";

feature
  .functional("REDUCE", (array, init, mapper) => {
    return array.reduce(mapper, init);
  })
  .withDescription("集合转换")
  .withGroup("集合");
