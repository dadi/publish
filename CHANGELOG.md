# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.12-beta] (2018-10-12)

### Changed

- [#379](https://github.com/dadi/publish/issues/379): remember previously selected save options in document edit view
- [#448](https://github.com/dadi/publish/issues/448): format DateTime fields in document list view
- [#510](https://github.com/dadi/publish/pull/510): add rich editor component with Markdown support
- [#514](https://github.com/dadi/publish/pull/514): batch load API collections
- [#521](https://github.com/dadi/publish/pull/521): further improvements to auto-resize feature of text inputs
- [#523](https://github.com/dadi/publish/pull/523): various UI tweaks
- [#534](https://github.com/dadi/publish/pull/534): add loading states to home view and to sign in and document save actions

### Fixed

- [#513](https://github.com/dadi/publish/pull/513): fix error when saving documents
- [#515](https://github.com/dadi/publish/pull/515): ensure document is saved on first attempt
- [#522](https://github.com/dadi/publish/pull/522): fix error on sign out in document edit view
- [#531](https://github.com/dadi/publish/pull/531): fix links on reference field select (create new document view)

## [1.0.11-beta] (2018-09-26)

- Fix problem with application bundle.

## [1.0.10-beta] (2018-09-25)

### Fixed

- Fix problem with application bundle.

## [1.0.9-beta] (2018-09-25)

### Changed

- [#470](https://github.com/dadi/publish/issues/470): use shorter notification duration
- [#476](https://github.com/dadi/publish/issues/476): show value of reference field in document list view, or "None" if no value selected
- [#497](https://github.com/dadi/publish/pull/497): add annotations to table head in document list view
- [#499](https://github.com/dadi/publish/issues/499): adds the public URL to the boot message
- [66d8b37](https://github.com/dadi/publish/commit/66d8b374c542acb009ce313bd87243fea9c54c2b): display image thumbnails in list view

### Fixed

- [#447](https://github.com/dadi/publish/issues/447): show nav on profile page
- [#475](https://github.com/dadi/publish/issues/475): Pagination fixed in document list view
- [#478](https://github.com/dadi/publish/issues/478): DateTime no longer editable when set to readonly

## [1.0.8-beta] (2018-09-04)

### Changed

* Replace "email" with "username"
* Redirect to previous URL when signing in
* Add support for API multi language
* Display message when CORS is not enabled in API
* Display message when required API version isn't being used 
* Show Edit button on Reference fields

## [1.0.6-beta] (2018-08-06)

### Changed

- [#384](https://github.com/dadi/publish/issues/384): Textbox view options

### Fixed

- [#305](https://github.com/dadi/publish/issues/305): Navigation z-index above menu
- [#357](https://github.com/dadi/publish/issues/357): Integrate @dadi/boot for consistency with other products
- [#359](https://github.com/dadi/publish/issues/359): Obscured date picker
- [#360](https://github.com/dadi/publish/issues/360): Sort menu items according to config file
- [#361](https://github.com/dadi/publish/issues/361): Image corruption investigation
- [#373](https://github.com/dadi/publish/issues/373): Document grid alignment when only 1 column
- [#376](https://github.com/dadi/publish/issues/376): "Go to page" input styling


## [1.0.5-beta] (2018-07-27)

### Fixed

- [#369](https://github.com/dadi/publish/issues/369): Header spacing & alignment
- [#370](https://github.com/dadi/publish/issues/370): Background pattern doesn't extend full height
- [#371](https://github.com/dadi/publish/issues/371): Dropdown nav size & spacing
- [#372](https://github.com/dadi/publish/issues/372): Collection sort order
- [#377](https://github.com/dadi/publish/issues/377): Ability to hide document section tabs when only one
- [#378](https://github.com/dadi/publish/issues/378): Delete confirmation box text size and spacing
- [#383](https://github.com/dadi/publish/issues/383): Checkbox/bool field adjustments
