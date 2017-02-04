1. [Setup](#setup)
  - [Installion and Development](#installation-and-development)
  - [Local Database](#local-database)
2. [ACL](#acl)
  - [Users](#users)
    - [User Types] (#user-types)
    - [Permissions per feature](#permissions-per-feature)
    - [Fields](#fields)
      - [Proposed user field concepts](#proposed-user-field-concepts)
    - [Syncing users with API](#syncing-users-with-api)
  - [Roles](#roles)
    - [Permission levels](#permission-levels)
    - [Role Filters](#role-filters)
3. [APIs](#apis)
  - [Adding and removing an API](#adding-and-removing-an-api)
  - [List view](#list-view)
  - [Status Monitoring (see Monitoring)](#monitoring)
  - [Proposed api concepts](#proposed-api-concepts)
4. [Collections](#collections)
  - [Collection List View](#collection-list-view)
  - [Collection Types](#collection-types)
5. [Fields](#fields)
  - [Standard Fields](#standard-fields)
  - [Custom Fields](#custom-fields)
  - [Field Actions](#field-actions)
  - [Proposed field concepts](#proposed-field-concepts)
6. [Monitoring](#monitoring)
  - [Types](#types)
  - [Alerts](#alerts)
7. [Documents](#documents)
  - [Document Editor](#document-editor)
  - [Editor types](#editor-types)
  - [Editor structure](#editor-structure)
8. [Workers](#workers)

## Setup
On first launch, publish requires the setup of the _super-admin_ user. This is a single user that has unrestricted permissions.

### Installation and development

#### Webpack
Publish uses webpack to compile and monitor changes to assets. We chose this approach because webpack compiles all reusable assets (JS, CSS, background images etc) into a single payload, delivered as *bundle.js* which reduces the number of http requests. This is important with a webapp, where the first page load contains all of the assets required to run the app, aside from data which is part of a seperate request mechanism. Webpack handles changes more effectively than other compilers, making it much faster during app development.

### Local Database
Publish has a local database, built with [reasondb](https://github.com/anywhichway/reasondb). This allows Publish to run without the requirement for API. The key benifits are:

- Launch Publish and create a user before adding API(s)
- Create abstracted user accounts that can be synced with multiple APIs with a consistent local Publish ID (see #Sync)
- Keep Publish running when APIs are under load, or offline
- Allow store of Publish related settings such as permissions, whitelisting for emails, contact details for text messages and email alerts

## ACL

### Users

#### User Types

Users are stored in Publish's local database and have three classification types with different permissions levels.

1. **Super Admin** - only one of these
2. **Admin**
3. **User**

Permission settings always work downwards, so an Admin can't edit **Super Admin** preferences, and a User can't edit **Admin** user preferences.

#### Permissions per feature

| Feature | Super Admin        | Admin           | User  |
| :------------- |:-------------:| :-------------:| :-------------:|
| Add Users      | Always | Configurable | Never |
| Add Roles      | Always | Configurable | Never |
| Add Documents      | Always | Configurable | Configurable |
| Create Documents      | Always | Configurable | Configurable |
| Update Documents      | Always | Configurable | Configurable |
| Delete Documents      | Always | Configurable | Configurable |
| View Publish Preferences      | Always | Configurable | Never |
| Edit Publish Preferences      | Always | Configurable | Never |


#### Fields

Users have default fields which include *Name*, *Email address*, *Roles* (multiple). 

If an email address is present, and the email alert module is enabled, the user can enable alerting. The same applies to the SMS message module.

> ##### *Proposed User field concepts*
Other fields can be added through *extensions* and *API schemas*. 
Extension fields could include parameters that specify user-specific prefernces that can affect the way an extension works
API fields could be extra fields that one or more of the synced API user collections contains (see [Syncing users with API](#syncing-users-with-api))

#### Syncing users with API

In the global Publish preferences *Super admin* and *Admin* users can select whether to sync Publish users to API. This can only happen when the [Collection type](#collection-types) is set to **user**.

When enabled, all publish user settings with be synced and when disabled, all publish users will be removed. 

The users **id** from Publish will be retained in the record so that the record can remain abstracted from API.

### Roles

Roles can be created by *super admin* and permission granted *admin* users and are used predominently for editing restrictions. **View**, **Add**, **Update** and **Delete** are the basic document permission options as well as **filters** which can restrict the view of documents within a collection. 

A user account can have more than one role. This can be used to apply different restrictions at a per-api level. 

#### Role Filters
Filters applied on a per-collection basis can restrict the users ability to see certain documents. Depending on the field type, the filter will display different options. For example, restricting the user to see documents where `published.state` is "published" and `title` contains "Foo" would appear as two filters in the filter editor. 

## APIs

### Adding and removing an API
To add an API, an authorised user must input the **host**, **port**, and **name** of the API. Further default options include **monitor** and **monitor frequency** (See [Monitoring](#monitoring))

### List view
This view shows an overview of the APIs including the IP address, number of collections, status (See [Monitoring](#monitoring)) and the API version information.

> #### *proposed API concepts*
##### Extension based options
Some APIs may have collections that include fields that require aditional information, for instance a `url` field may require base urls for **live** and **preview** which would affect the generated url for a view button which itself would be applied to the operational menu for the document. 

## Collections

Collections are stored in the [Local database](#local database) and include all of the information provided by the collection json response. They can be updated periodically when [Monitoring](#monitoring) is enabled on the API.

### Collection List View
This view gives an overview of each collection in an API. Fields include **Fields** and **Documents** counter, **Slug**, **Type** (See [Collection Types](#collection-types)) and [Monitoring](#monitoring) information.

### Collection Types

Collection types are used by Publish to decide how to treat the way it presents the collection and the documents within. These treatments include, but are not limited to:

1. How a field appears in the list view and document editor
2. How an extension works within the list view
3. The layout of the document editor
4. Whether a collection is visible within the collection list
6. Which views (history, edit, collaborative etc) are available and how they are presented

## Fields

### Standard Fields
Standard fields mirror the primitive fields available through an API collection schema. They have events for all of the [Field Actions](#field-actions) and come as standard in the basic build of Publish. They can't be extended so when extension is required, a [Custom Field](#custom-field) should be used


### Custom Fields

Custom fields are required when a specific logic and UI is required to make editing a field simpler. For Example, this could be an _Image_ field, which is a non-primative Object with preset presentational concepts and a rich interface with intergrated search and cropping tools.

Custom fields contain their own logic for handling the basic [Field Actions](#field-actions). They include their own CSS properties and can inject custom actions into the global state actions and reducers.

Custom fields can contain JSX and SASS, but the SASS is not compiled with [Webpack](#webpack). This allows engineers the freedom to use any pre-processor they want (LESS, SCSS etc).

### Field Actions
| Action |Definition| Example |
| :------------- |:-------------|:-------------|
| fieldWillLoad | Triggered when field data is recieved from API. Often used for sanitisation | A date field is converted from an epoch timecode to a human-readable date format|
| fieldWillSave | Triggered when field data is about to post. Often used to serialise | A date field is coverted from a human-readable date value back into epoch|
| fieldDidSave | Triggered after a field has saved. Often used to update the UI. | After API has initialised save, the slugify hook changes the `furl` field, which in turn requires the **View** button linked to the document to change it's href value|
| fieldDidChange | Triggered whenever the value of a field is changed | Trigger validation on a field if present|
| fieldDidFocus| Triggered when the user focuses on a field | Trigger a socket update to all users looking at the document to show that the field is selected by the current user |
| fieldDidBlur | Triggered when a user loses focus on a field | Makes a field available for edit by another editor during the collaborative editing extension session |

> #### *Proposed field concepts*
##### Field UI operations
Fields should be able to change the view they appear in, gaining access to containers and components within the view.
###### Example
The **\_layout** field stores an array of objects designed to assist web in the display of document data. In order to force a strict editor presentation, including article sections, restricting field usage within article sections, free sections and field relationships, this field needs to be able to overide the standard main body layout with its own composition. 
###### Custom Field Marketplace
Custom fields are required when a specific logic and UI makes it difficult to display the value of the field in a human-readable easy-to-edit manor. The fields are often specific to business logic or workflow but are often reusable in other projects. The ability to share and collaborate could be useful.

## Monitoring

Monitoring is set on a per-api basis and will check the status of an API and it's collections at an interval, and fetch the remote collections schema in order to keep the Publish interface in sync with API.

### Types

| Feature | Default|Definition|
| :------------- |:-------------:|:-------------|
| Enabled      | true | Is Monitoring on|
| Frequency      | 600 | How many milliseconds between checks |
| Auto update Schema      | true | Fetch the remote schema and replace the local copy |
| Alert      | true | Status alerts enabled (Only for users with alerting enabled|

### Alerts
Alerts require modules, for instance Email alerts will only work when an email gateway module is installed and configured. They are triggered when:
- API is down
- API is up
- Collection changed
- Document save failed

## Documents

The primary focus of the Publish platform is to facilitate the creation and editing of documents within a rich, feature packed UI

### Document Editor

The document editor presents all of the API fields with their own component structure. This means that the collection schema must contain a `publish` block for configuration. The Publish block will outline the field `subType` when the field has more than one parameter (See [Custom fields](#custom-fields)). 

### Editor Types

Depending on the data being edited, there are different requirements for layout. The editors presentation structure depends on the fields in collection schema, and also the `type` value in the collection settings block. Example: When editing pricing data for a product, the user is presented with a tabulated view. There are no rich text features, images or other presentational fields so the interface can be simple, clean and basic. An collection with the field of type `article` is used to achieve a more presentational-focused document view that will closely resemble the view seen in the frontend.

### Editor Structure

Depending on the [Custom fields](#custom-fields) and [Collection type](#collection-types) the editor view may require some level of structure. In the `article` collection type, some fields may be optional, as well as repeatable, meaning the editor must be presented with a document canvas rather than a set of inputs. Whilst this offers some level of freedom, there are also some situations where a structure will be applied, such as having a **hero** section, a **body** section and **footer**. The **hero** could have restrictions that allow the use of a video, or image, but nothing else. The body might contain a repeatable component such as **paragraph** as well as **images**, **quotes**, **embeds** and much more. 

Some may need to be _strural_, such as **title** or the first **paragraph** which needs to appear, but be empty. This encourages the editor to fill in these elements and makes it obvious they are fairly default, without forcing them to appear

## Workers

Workers are tasks that Publish manages and runs at interval or after an event. These may become part of queue, but for now they are managed within the Publish interface. Each come with basic options such as **frequency**, **collection**, **api**. 

They are modular and contain customisable logic, running as seperate processes with throttling.



