import * as migration_20261108_122014_initial from "./20261108_122014_initial";
import * as migration_20261108_162654_feedback from "./20261108_162654_feedback";
import * as migration_20261112_200624_r2_storage from "./20261112_200624_r2_storage";

export const migrations = [
  {
    up: migration_20261108_122014_initial.up,
    down: migration_20261108_122014_initial.down,
    name: "20261108_122014_initial",
  },
  {
    up: migration_20261108_162654_feedback.up,
    down: migration_20261108_162654_feedback.down,
    name: "20261108_162654_feedback",
  },
  {
    up: migration_20261112_200624_r2_storage.up,
    down: migration_20261112_200624_r2_storage.down,
    name: "20261112_200624_r2_storage",
  },
];
