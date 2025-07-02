# Code the Dream Node/Express Course: Homework and Exercises

This repository contains homework and exercises for the Node/Express course.

## Setup

Please follow the following steps to set up the repository.

1. Before you start: Have Node installed on your laptop. You can install it [here.](https://nodejs.org/en/download) Have VSCode installed as well. Windows users should also install [Git for Windows](https://gitforwindows.org/), if you haven't already. **Windows users should also configure the VSCode terminal default profile to be Git Bash.**
2. Within a terminal session, open the folder where you keep your code, and do:
   ```bash
   git clone https://github.com/Code-the-Dream-School/node-homework
   ```
3. Log on to your GitHub account, and create an empty repository called `node-homework`. This repository must be public. Do not create a README or `.gitignore` or license. Once you have done this, copy the URL for the repository to your clipboard. (There is a green button on the repository window, with a dropdown where you can obtain the URL you need. You may use either HTTPS or SSH, depending on your current practice.)
4. On your laptop, switch to the node-homework directory, and within the terminal, do the following commands:
   `bash
 git remote set-url origin <URL> # This is the URL you copied to your clipboard
 git remote add upstream https://github.com/Code-the-Dream-School/node-homework
 git push origin main
 npm install
 `
   You are populating your own repository with the contents of this Code the Dream School repository. You do it this way, instead of creating a fork, because you want the default target for your homework pull requests to be your own repository. The `npm install` gives you the packages you need to run the homework programs.

Once in a while, it may be necessary to get an update to this repository from Code the Dream School. You will be notified via Slack. In this case, you'd do the following:

```bash
git checkout main
git pull upstream main
```

You may have an assignment branch active when these updates are needed. So then you'd do:

```bash
git checkout main
git pull upstream main
git checkout assignmentx # the branch you were working in
git merge main
```

If you have uncommitted changes in your working branch, the `git checkout main` may give an error message. So then you'd do:

```bash
git stash
git checkout main
git pull upstream main
git checkout assignmentx # the branch you were working in
git merge main
git stash apply
```

This procedure should be infrequent -- only when changes are made to the course.

## Database Setup

This course uses SQL for Node projects. You create a database on [https://neon.tech](https://neon.tech).

1. Create a free account at neon.tech.
2. Create a project called `node-homework`.
3. Click on `Connect to your database`. Click on `Show password`. Copy the displayed string to your clipboard.
4. On your laptop, go to your `node-homework` folder and start VSCode using the command `code .`.
5. Create a file called `.env`. The file should have the following line:
   ```
   DB_URL=<your database URL>
   ```
   where you paste in the string you copied to your clipboard.

**Note: This database URL contains a password. Never put this string in your code.** If you do, it will end up in GitHub, and then it is public information. You wouldn't want that. If you disclose a password or other secret on GitHub, there is no recovery except to change the password or secret, and to ensure you don't disclose it again.

You now populate the database with the following command in your VSCode terminal:

```bash
node load-db.js
```

If your environment is set up correctly, the program will log messages that database tables have been populated. Go back to `neon.tech` and click on `tables` in the left hand menu. You'll see the data that was stored.

## To do an Assignment

These are the steps:

1. Create an assignment git branch. For assignment1, the command is:
   ```bash
   git checkout -b assignment1
   ```
   In general, you
2. Switch to the assignment1 directory. This is where you create your code.
3. Follow the instructions in the assignment to complete and test your work.

## To Submit an Assignment

1. Do these commands:

   ```bash
   git add -A
   git commit -m "some meaningful commit message"
   git push origin assignmentx  # The branch you are working in.
   ```

2. Go to your `node-homework` repository on GitHub. Select your `assignmentx` branch, the branch you were working on. Create a pull request. The target of the pull request should be the main branch of your GitHub repository.
3. Once the pull request (PR) is created, your browser contains the URL of the PR. Copy that to your clipboard. Include that link in your homework submission.
