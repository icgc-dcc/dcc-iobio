# How to contribute
Here are a few guidelines and tips on how to start contributing to thie dcc-iobo project.

## Getting Started
* Make sure you have a [GitHub account](https://github.com/signup/free).
* If an DCC team member, make sure you have a Jira Account.
* Submit a ticket for your issue, assuming one does not already exist.
  * Clearly describe the issue including steps to reproduce when it is a bug.
  * Make sure you fill in the earliest version that you know has the issue.

## Making Changes

* Create a feature branch from where you want to base your work.
  * This is usually the master branch.
  * To quickly create a topic branch based on master; `git checkout -b
    fix/master/my_contribution master`. Please avoid working directly on the
    `master` branch.
* Make commits of logical units.
* Make sure your commit messages are readable concisely describe your changes.

## Submitting Changes

### Before Opening a Pull Request
* Make sure you test your changes. Ensure the new docker container works.
* Ensure any new files and work contains the GPLv3 license used by the project. 
* Ensure new code follows the conventions and style of the existing code. Remove extra white space, ensure consistent tab spacing with the project, and ensure readability. 

### Open a Pull Request
* Describe in pull request message the task/feature that was accomplished. 
* Link to issue if possible.
* If code changes are major, describe the changes at a high level. 

# License
* When you contribute code, you affirm that the contribution is your original work and that you license the work to the project under the project's open source license. Whether or not you state this explicitly, by submitting any copyrighted material via pull request, email, or other means you agree to license the material under the project's open source license and warrant that you have the legal authority to do so.

# Additional Resources

* [Docker](https://www.docker.com/)
* [iobio](http://iobio.io)
* [ICGC DCC Documentation](http://docs.dcc.icgc.org)
* [General GitHub documentation](https://help.github.com/)
* [GitHub pull request documentation](https://help.github.com/send-pull-requests/)
* [Guide to GPLv3](http://www.gnu.org/licenses/quick-guide-gplv3.en.html)