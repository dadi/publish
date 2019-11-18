# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [3.0.1](2019-11-18)

### Fixed

- [#820](https://github.com/dadi/publish/pull/820): fix routing issue in single-document collections

## [3.0.0](2019-10-29)

### Added

- [#389](https://github.com/dadi/publish/issues/389): add string list component
- [#709](https://github.com/dadi/publish/issues/709): give focus to the Username field on sign-in page
- [#730](https://github.com/dadi/publish/pull/730): introduce API URL for internal server access
- [#762](https://github.com/dadi/publish/pull/762): add support for single-document collections

### Changed

- [#755](https://github.com/dadi/publish/pull/755): adjust to API 6.0 URL format
- [#770](https://github.com/dadi/publish/pull/770): add new styling

### Fixed

- [#642](https://github.com/dadi/publish/issues/642): sorting in reference select view
- [#646](https://github.com/dadi/publish/issues/646): text overlaps when field has long comment property
- [#685](https://github.com/dadi/publish/issues/685): reference fields container overflow
- [#698](https://github.com/dadi/publish/pull/698): fixed the URL of the inline image select view when creating new documents
- [#706](https://github.com/dadi/publish/issues/706): allow Number fields to be unset
- [#713](https://github.com/dadi/publish/issues/713): offline API causes white screen when a session is present
- [#727](https://github.com/dadi/publish/issues/727): crash after changing API address and logging back in
- [#732](https://github.com/dadi/publish/pull/732): use correct link for documents on reference select view
- [#739](https://github.com/dadi/publish/issues/739): unable to clear Reference field on list view
- [#746](https://github.com/dadi/publish/issues/746): link field appears out of body copy panel
- [#749](https://github.com/dadi/publish/issues/749): can't add text to an article that ends with an image
- [#750](https://github.com/dadi/publish/issues/750): can't add body copy, after trying to save without it
- [#757](https://github.com/dadi/publish/pull/757): fix miscellaneous bugs with DateTime field
- [#765](https://github.com/dadi/publish/pull/765): clear selection when leaving select view

### BREAKING CHANGES

Versions of API prior to 6.0.0 are no longer supported.

## [2.3.1](2019-04-12)

### Fixed

- [#681](https://github.com/dadi/publish/issues/681): fix issue where images inserted in the rich editor would have a broken link

## [2.3.0](2019-04-10)

### Added

- [#672](https://github.com/dadi/publish/pull/672): add filters to Reference select view
- [#674](https://github.com/dadi/publish/pull/674): add filters to Media Library and Reference select view for Media fields
- [660b15b](https://github.com/dadi/publish/commit/660b15be7dbe09f0d53b7d172a7eebae6ec68f8b): add button for filtering document list view by selected state

### Fixed

- [806a215](https://github.com/dadi/publish/commit/806a2159bfad4b6fdf5bd28dac74b7181226272f): fix issue where invalid cookies would cause a blank page
- [ba1020c](https://github.com/dadi/publish/commit/ba1020c28b4ec8f216b14dece16bde04d45c7917): fix issue where changing the field which a filter operated on would reset the filter value if the field was of type `Number`

## [2.2.0](2019-02-28)

### Changed

- [#666](https://github.com/dadi/publish/pull/666): rename label of bulk actions dropdown to "Bulk actions"
- [#667](https://github.com/dadi/publish/pull/667): make sidebar scroll alongside the main column in the document edit view

### Fixed

- [#663](https://github.com/dadi/publish/issues/663): fix issues with validation of Reference fields
- [#664](https://github.com/dadi/publish/issues/664): fix validation of newly-uploaded Media objects
- [#668](https://github.com/dadi/publish/issues/668): fix rendering of DateTime fields when adding filters
- [#669](https://github.com/dadi/publish/pull/669): fix issue with the wrong date being selected in DateTime picker
- [#670](https://github.com/dadi/publish/pull/670): fix issue with the scroll position of the RichEdit component jumping around when in text mode

## [2.1.0](2019-01-29)

### Added

- [#659](https://github.com/dadi/publish/pull/659): add support for custom CSS in workspace directory

## [2.0.3](2019-01-09)

### Fixed

- [#652](https://github.com/dadi/publish/pull/652): fix error when loading String fields with an `options` block

## [2.0.2](2018-12-17)

### Changed

- [#650](https://github.com/dadi/publish/pull/650): enforce stricter validation on configuration files

### Fixed

- [#644](https://github.com/dadi/publish/issues/644): make Add filter popup respect default operator
- [#651](https://github.com/dadi/publish/pull/651): fix issue with the RichEditor component that would crash the app when unmounting

## [2.0.1](2018-12-06)

### Fixed

- fix issue with pagination when selecting referenced document
- show 404 message when accessing collection that doesn't exist

## [2.0.0](2018-12-05)

First public release.

## [1.0.21-beta](2018-12-04)

### Changed

- [#535](https://github.com/dadi/publish/issues/635): open linkable fields in new window

### Fixed

- [#638](https://github.com/dadi/publish/pull/638): fix issues when saving existing Reference fields

## [1.0.20-beta](2018-12-03)

### Changed

- minor fixes in preparation for 2.0.0 release.

## [1.0.19-beta](2018-12-03)

### Added

- add `globals` object to configuration file.

## [1.0.18-beta](2018-12-03)

### Fixed

- gracefully handle empty `apis` configuration block

## [1.0.17-beta](2018-12-03)

### Added

- [#543](https://github.com/dadi/publish/issues/543): ensure DropArea respects MIME type validation

### Changed

- [#629](https://github.com/dadi/publish/pull/629): escape HTML when creating code block
- [#630](https://github.com/dadi/publish/pull/630): make `contains` the default operator when creating new filter

### Fixed

- [#419](https://github.com/dadi/publish/issues/419): recover from remote API validation errors
- [#527](https://github.com/dadi/publish/issues/527): gracefully handle API authentication errors
- [#623](https://github.com/dadi/publish/issues/623): show notification after deleting items on media list view

## [1.0.16-beta](2018-11-23)

### Fixed

- ensure images are loaded from CDN when a `cdn` block exists in the configuration

## [1.0.15-beta](2018-11-23)

### Added

- [#573](https://github.com/dadi/publish/pull/573): add media list view
- [#577](https://github.com/dadi/publish/pull/577): add media edit view
- [#592](https://github.com/dadi/publish/pull/592): add support for inline images in rich editor
- [#601](https://github.com/dadi/publish/pull/601): add Color field
- [#605](https://github.com/dadi/publish/pull/605): add workspace directory
- [#614](https://github.com/dadi/publish/issues/614): display version number in menu

### Changed

- [#571](https://github.com/dadi/publish/pull/571): improved functionality of Link control in rich editor
- [#600](https://github.com/dadi/publish/pull/600): rebuild filters
- [#615](https://github.com/dadi/publish/pull/615): display "Document not found" message for uncomposed references

### Fixed

- [#412](https://github.com/dadi/publish/pull/412): stop unsaved changes from leaking to different documents
- [#564](https://github.com/dadi/publish/issues/564): fix issue with rich editor and multi-language documents
- [#593](https://github.com/dadi/publish/issues/593): fix issue with changes to fields not being persisted
- [#595](https://github.com/dadi/publish/issues/595): fix issue with language dropdown causing an error in document edit view
- [#596](https://github.com/dadi/publish/issues/596): fix issue with save options causing an error in document edit view
- [#603](https://github.com/dadi/publish/pull/603): stop notifications from obstructing full width of the viewport

## [1.0.14-beta](2018-11-05)

### Added

#### "Linkable" fields

Linkable fields allow you to use the value of a field to create links to external resources in the Publish interface.
An example use case for this is a Twitter username. By specifying a `display.link` property, Publish creates a full
link for display, using the value of the field in place of the `{value}` placeholder.

**Example API schema**

```json
"twitter": {
  "type": "String",
  "label": "Twitter",
  "publish": {
    "section": "Details",
    "display": {
      "edit": true,
      "list": true,
      "link": "https://twitter.com/{value}"
    }
  }
}
```

If the value of your field is already a fully formed URL, set the `link` property to `true` to have Publish create a clickable link:

```json
"twitter": {
  "type": "String",
  "label": "Twitter",
  "publish": {
    "section": "Details",
    "display": {
      "edit": true,
      "list": true,
      "link": true
    }
  }
}
```

### Changed

- [#559](https://github.com/dadi/publish/pull/559): This PR addresses a small issue if you set a Reference field or Media field as the first displayed field in your API schema you are unable to click through from the list view (both those fields override the link).
- [#562](https://github.com/dadi/publish/pull/562): adds a basic fullscreen mode for the rich editor
- [#565](https://github.com/dadi/publish/issues/565): use field name as label in columns when no label specified
- [#568](https://github.com/dadi/publish/pull/568): disable autocomplete in input elements

## [1.0.13-beta](2018-10-25)

In this release, Publish gets a UI refresh. Additional changes linked below.

[#477](https://github.com/dadi/publish/issue/477): Linkable fields
[#489](https://github.com/dadi/publish/issue/489): Reference field is still editable when set to readonly
[#511](https://github.com/dadi/publish/issue/511): Refactor SSL, resolves installation issue using Node.js 10
[#526](https://github.com/dadi/publish/pull/526): Support multiple referenced images
[#532](https://github.com/dadi/publish/issue/532): Rich editor uses auto-height by default
[#538](https://github.com/dadi/publish/pull/538): Render first image only in list view when a field contains multiple images
[#544](https://github.com/dadi/publish/issue/544): Fields with dropdown options fail to save
[#545](https://github.com/dadi/publish/issue/545): Pagination links incorrect when sorting
[#554](https://github.com/dadi/publish/pull/554): Media field added to replace subType "Image". Use `"subType": "Media"` in field configurations
[#555](https://github.com/dadi/publish/pull/555): Image fields use CDN for preview if configured

## [1.0.12-beta](2018-10-12)

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

## [1.0.11-beta](2018-09-26)

- Fix problem with application bundle.

## [1.0.10-beta](2018-09-25)

### Fixed

- Fix problem with application bundle.

## [1.0.9-beta](2018-09-25)

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

## [1.0.8-beta](2018-09-04)

### Changed

- Replace "email" with "username"
- Redirect to previous URL when signing in
- Add support for API multi language
- Display message when CORS is not enabled in API
- Display message when required API version isn't being used
- Show Edit button on Reference fields

## [1.0.6-beta](2018-08-06)

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

## [1.0.5-beta](2018-07-27)

### Fixed

- [#369](https://github.com/dadi/publish/issues/369): Header spacing & alignment
- [#370](https://github.com/dadi/publish/issues/370): Background pattern doesn't extend full height
- [#371](https://github.com/dadi/publish/issues/371): Dropdown nav size & spacing
- [#372](https://github.com/dadi/publish/issues/372): Collection sort order
- [#377](https://github.com/dadi/publish/issues/377): Ability to hide document section tabs when only one
- [#378](https://github.com/dadi/publish/issues/378): Delete confirmation box text size and spacing
- [#383](https://github.com/dadi/publish/issues/383): Checkbox/bool field adjustments
