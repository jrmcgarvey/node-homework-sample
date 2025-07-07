const { taskSchema, patchTaskSchema } = require("../validation/taskSchema.js");
const { StatusCodes } = require("http-status-codes");

const prisma = require("../db/prisma")

const index = async (req, res) => {
  const allTasks = await prisma.Task.findMany({
    where: {
      userId: req.user.id,
    },
    omit: { userId: true },
  });
  if (allTasks.length == 0) {
    res.status(StatusCodes.NOT_FOUND).json({ message: "No tasks were found." });
  } else {
    res.json(allTasks);
  }
};

const create = async (req, res) => {
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: error.details });
  }
  value.userId = req.user.id;

  const newTask = await prisma.Task.create({
    data: value,
    omit: { userId: true },
  });
  res.status(StatusCodes.CREATED).json(newTask);
};

const update = async (req, res) => {
  const { error, value } = patchTaskSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: error.details });
  }
  const updated = await prisma.Task.updateMany({
    data: value,
    where: {
      id: parseInt(req.params.id),
      userId: req.user.id,
    },
  });
  if (!updated.count) res.status(StatusCodes.NOT_FOUND);
  res.json({});
};

const show = async (req, res) => {
  const task = await prisma.Task.findFirst({
    where: {
      userId: req.user.id,
      id: parseInt(req.params.id),
    },
    omit: { userId: true },
  });
  if (!task) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "That task was not found." });
  }
  res.json(task);
};
const deleteTask = async (req, res) => {
  const deleted = await prisma.Task.deleteMany({
    where: {
      id: parseInt(req.params.id),
      userId: req.user.id,
    },
  });
  if (!deleted.count) res.status(StatusCodes.NOT_FOUND);
  res.json({});
};

module.exports = { index, create, show, update, deleteTask };
