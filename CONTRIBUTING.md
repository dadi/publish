## Contributing

We'd love for you to contribute to our source code and to make DADI products even better.

## <a name="question"></a> Got a Question or Problem?

Documentation can be found at [docs.dadi.tech](https://docs.dadi.tech).

If the documentation doesn't answer your problem please feel free to email the
DADI team directly on team@dadi.tech

## <a name="issue"></a> Found an Issue?
If you find a bug in the source code or a mistake in the documentation, you can help us by submitting an issue to the product's [GitHub repository][github]. But we'd love it if you submitted a Pull Request with a fix instead!

**Please see the Submission Guidelines below**.

## <a name="feature"></a> Want a Feature?
You can request a new feature by submitting an issue to our [GitHub][github] issue tracker. If you would like to implement a new feature then consider what kind of change it is:

* **Major Changes** that you wish to contribute to the project should be added as
a `Feature Request` in the [GitHub][github] issue tracker. This will get the conversation started.
* **Small Changes** can be crafted and submitted to the [GitHub repository][github] as a Pull Request.

## <a name="submit"></a> Submission Guidelines

### Submitting an Issue
Before you submit your issue search one of the issue archives, maybe your question was already answered. Issue trackers for major products: [API][issues_api], [CDN][issues_cdn], [Web][issues_web].

If your issue appears to be a bug, and hasn't been reported, open a new issue.
Help us to maximise the effort we can spend fixing issues and adding new
features, by not reporting duplicate issues.  Providing the following information will increase the chances of your issue being dealt with quickly:

* **Overview of the issue** - if an error is being thrown a non-minified stack trace helps
* **DADI product version**
* **Operating system**
* **Steps to reproduce** - provide a set of steps to follow to reproduce the error.
* **Related issues** - has a similar issue been reported before?
* **Suggest a fix** - if you can't fix the bug yourself, perhaps you can point to what might be causing the problem (e.g. a line of code or a commit)

### Submitting a Pull Request
Before you submit your pull request consider the following guidelines:

1) Search GitHub for an open or closed Pull Request that relates to your submission. You don't want to duplicate effort. Pull requests for major products: [API][pulls_api], [CDN][pulls_cdn], [Web][pulls_web].

2) Create your patch, **including appropriate test cases**.

3) Follow our [Coding Rules](#rules).

4) Run the full test suite using `npm test` and ensure that all tests pass.

5) Commit your changes using a descriptive commit message that follows our
  [commit message conventions](#commit-message-format) and passes our commit message presubmit hook. Adherence to the [commit message conventions](#commit-message-format) is required because release notes are automatically generated from these messages.

6) Send a pull request to the `master` branch.

7) Documentation! Please add relevant documentation to the pull request. If this is a new feature then please document it fully within the pull request. If you're making changes to an existing feature, please give us a link to the existing [documentation][docs] along with your documentation changes.

> If you need an example of excellent pull request documentation, have a look at the [effort put in here](https://github.com/dadi/api/pull/27).

**That's it! Thank you for your contribution!**

## <a name="rules"></a> Coding Rules
To ensure consistency throughout the source code we follow the style rules defined by [StandardJS](https://github.com/feross/standard). Please keep [these rules](https://github.com/feross/standard#the-rules) in mind as you are working.

In addition, we require that:

* All features or bug fixes **must be tested** by one or more tests. Browse one of the test suites for examples: [API][tests_api], [CDN][tests_cdn], [Web][tests_web].
* All public API methods **must be documented** with [JSDoc](http://usejsdoc.org/).

## <a name="commit"></a> Git Commit Guidelines

### One Change Per Commit

A commit should contain exactly one logical change. A logical change includes adding a new feature, fixing a specific bug, etc. If it's not possible to describe the high level change in a few words, it is most likely too complex for a single commit. The diff itself should be as concise as reasonably possibly and it's almost always better to err on the side of too many patches than too few. As a rule of thumb, given only the commit message, another developer should be able to implement the same patch in a reasonable amount of time.

Please don't include more than one change in each patch. If your commit message requires an "and" in the middle, it's likely you need separate commits.

### Commit Message Format

We use [Semantic Release](https://github.com/semantic-release/semantic-release) to publish new versions of our products, and as such we have very precise rules over how our git commit messages can be formatted. This leads to **more readable messages** that are easy to follow when looking through the **project history**.  We also use the git commit messages to **generate the change log**.

The commit message format validation can be initialised by running `npm run init` from the root of the repository. This will add a symlink at `.git/hooks/commit-msg` which will be run every time you commit.

#### Message Format

```
type: subject

Optional long description

BREAKING CHANGE: Optional

Fix #xxx
Close #yyy
Ref #zzz
```

Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special format that includes a **type** and a **subject**:

##### Type: must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

##### Subject
The subject contains a succinct description of the change:

* use the imperative, present tense: "fix" not "fixed" nor "fixes"
* don't capitalize first letter of *type* or *description* e.g. "fix: foo Bar"
* no period (.) at the end

##### Body
Just as in the **subject**, write your commit message in the imperative: "Fix bug" and not "Fixed bug" or "Fixes bug". This convention matches up with commit messages generated by commands like `git merge` and `git revert`.

The body should include the motivation for the change and contrast this with previous behavior.

##### Footer
The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit might **Fix** or **Close**.

**Breaking Changes** should start with the words `BREAKING CHANGE:` followed by a space or two newlines. The rest of the commit message is then used for this.

**Autoclose issues and pull requests**

* Use `Fix #xxx` when the commit fixes an open issue.
* Use `Close #xxx` when the commit closes an open pull request.

**Reference another issue or pull request**
* Use `Ref #xxx` when referencing an issue or pull request that is already closed or should remain open. Examples include partial fixes and commits that add a test but not a fix.

#### Line Length
Any line of the commit message cannot be longer 100 characters. This allows the message to be easier to read on GitHub as well as in various git tools.

#### Examples

##### A bug fix

Commit messages like this will generate a new patch version:

```
fix: package.json & .snyk to reduce vulnerabilities
```

##### A new feature

Commit messages like this will generate a new minor version:

```
feat: add remove method to DiskStorage
```

##### A breaking change

Commit messages like this will generate a new major version:

```
feat: remove existing delete() method from DiskStorage

BREAKING CHANGE: removing the delete method affects all client appliations that
use the delete method directly
```

#### Reverting
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.


[github]: https://github.com/dadi
[pulls_api]: https://github.com/dadi/api/pulls
[pulls_cdn]: https://github.com/dadi/cdn/pulls
[pulls_web]: https://github.com/dadi/web/pulls
[tests_api]: https://github.com/dadi/api/tree/master/test
[tests_cdn]: https://github.com/dadi/cdn/tree/master/test
[tests_web]: https://github.com/dadi/web/tree/master/test
[issues_api]: https://github.com/dadi/api/issues
[issues_cdn]: https://github.com/dadi/cdn/issues
[issues_web]: https://github.com/dadi/web/issues
[docs]: https://docs.dadi.tech
