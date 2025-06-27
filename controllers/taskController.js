const { PrismaClient, Prisma } = require("@prisma/client");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema.js");

const prisma = new PrismaClient();

const index = async (req, res) => {
  const allTasks = await prisma.Task.findMany({
    where: {
      userId: req.user.id,
    },
  });
  if (allTasks.length == 0) {
    res.status(404).json({ message: "No tasks were found." });
  } else {
    res.json(allTasks);
  }
};

const create = async (req, res) => {
  const { error, value } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details });
  }
  value.userId = req.user.id;

  const newTask = await prisma.Task.create({ data: value });
  res.json(newTask);
};

const update = async (req, res) => {
  const { error, value } = patchTaskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details });
  }
  let newTask;
  try {
    newTask = await prisma.Task.update({
      data: value,
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
    });
  } catch (e) {
    if (typeof e == Prisma.PrismaClientKnownRequestError) {
      return res
        .status(401)
        .json({ message: "The entry could not be updated" });
    }
    throw e; // any other kind of error
  }
  res.json(newTask);
};

const show = async (req, res) => {
  const task = await prisma.Task.findFirst({
    where: { userId: req.user.id, id: parseInt(req.params.id) },
  });
  if (!task) {
    return res.status(404).json({ message: "That task was not found." });
  }
  res.json(task);
};
const deleteTask = async (req, res) => {
  let newTask;
  try {
    newTask = await prisma.Task.delete({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.Id,
      },
    });
  } catch (e) {
    if (typeof e == Prisma.PrismaClientKnownRequestError) {
      return res
        .status(401)
        .json({ message: "The entry could not be updated" });
    }
    throw e; // any other kind of error
  }
  res.json(newTask);
};

module.exports = { index, create, show, update, deleteTask };
