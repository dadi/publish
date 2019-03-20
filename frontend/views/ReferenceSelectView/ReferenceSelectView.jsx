'use strict'

import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'
import {Format} from 'lib/util/string'
import {getFieldType, getVisibleFields} from 'lib/fields'
import {route} from '@dadi/preact-router'
import {URLParams} from 'lib/util/urlParams'

import * as Constants from 'lib/constants'
import * as documentActions from 'actions/documentActions'
import * as documentsActions from 'actions/documentsActions'
import * as fieldComponents from 'lib/field-components'

import Button from 'components/Button/Button'
import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'components/DocumentListController/DocumentListController'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import DocumentTableList from 'components/DocumentTableList/DocumentTableList'
import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import MediaGridCard from 'containers/MediaGridCard/MediaGridCard'
import Page from 'components/Page/Page'
import ReferenceSelectHeader from 'components/ReferenceSelectHeader/ReferenceSelectHeader'

class ReferenceSelectView extends Component {
  getRedirectUrl() {
    const {
      onBuildBaseUrl,
      referencedField,
      state
    } = this.props
    const {currentCollection: collection} = state.api
    const referenceFieldSchema = collection.fields[referencedField]

    return onBuildBaseUrl.call(this, {
      createNew: !Boolean(state.router.parameters.documentId),
      search: null,
      section: referenceFieldSchema &&
        referenceFieldSchema.publish &&
        Format.slugify(referenceFieldSchema.publish.section)
    })
  }

  handleDocumentDelete(ids) {
    const {actions, state} = this.props
    const {
      currentApi: api,
      currentCollection: collection
    } = state.api

    actions.deleteDocuments({
      api,
      collection,
      ids
    })
  }

  handleDocumentSelect(fieldComponent) {
    const {
      actions,
      referencedField,
      state
    } = this.props
    const {currentCollection: collection} = state.api
    const {selected} = state.documents
    const selectedDocuments = selected.filter(Boolean)

    let update = {
      [referencedField]: selectedDocuments
    }
    let meta

    if (typeof fieldComponent.afterReferenceSelect === 'function') {
      let hookResult = fieldComponent.afterReferenceSelect({
        documents: selectedDocuments,
        field: referencedField
      }) || {}

      update = hookResult.update || update
      meta = hookResult.meta || meta
    }

    actions.updateLocalDocument({
      meta,
      path: collection.path,
      update
    })

    route(this.getRedirectUrl())
  }

  handleEmptyDocumentList() {
    const {
      filter,
      onBuildBaseUrl,
      referencedField
    } = this.props

    if (filter) {
      return (
        <HeroMessage
          title="No documents found."
          subtitle="We can't find anything matching those filters."
        >
          <Button
            accent="system"
            href={onBuildBaseUrl.call(this, {
              referenceFieldSelect: referencedField,
              search: {}
            })}
          >Clear filters</Button>
        </HeroMessage>
      )
    }

    return (
      <HeroMessage
        title="No documents yet."
        subtitle="Once created, they will appear here."
      />
    )    
  }

  handleRenderDocuments(reference, fields, documentProps) {
    let selectLimit = reference.limit || Infinity

    if (reference.collection.IS_MEDIA_BUCKET) {
      return (
        <DocumentGridList
          {...documentProps}
          onRenderCard={(item, onSelect, isSelected) => (
            <MediaGridCard
              item={item}
              isSelected={isSelected}
              onSelect={onSelect}
              selectLimit={selectLimit}
            />
          )}
          selectLimit={selectLimit}
        />
      )
    }

    return (
      <DocumentTableList
        {...documentProps}
        fields={fields}
      />
    )
  }

  render() {
    const {
      documentId,
      onBuildBaseUrl,
      order,
      page,
      referencedField,
      sort,
      state
    } = this.props
    const {newFilter} = this.state
    const {
      currentApi,
      currentCollection
    } = state.api
    const {
      list: documents,
      selected: selectedDocuments
    } = state.documents
    const {
      search = {}
    } = state.router

    if (
      !currentApi ||
      !currentCollection ||
      !currentCollection.fields[referencedField]
    ) {
      return null
    }

    let referencedFieldType = getFieldType(
      currentCollection.fields[referencedField]
    )
    let fieldComponent = fieldComponents[`Field${referencedFieldType}`]

    // If the field component does not declare a `beforeReferenceSelect`
    // method, it means it's not meant to handle references.
    if (
      !fieldComponent ||
      typeof fieldComponent.beforeReferenceSelect !== 'function'
    ) {
      return null
    }

    // If the field component does contain the method, we treat it as a hook.
    // We call it by passing the API, collection and field we're operating on,
    // and expect back a few things, such as the collection to search on, any
    // filters that should be applied to the search as well as a few other
    // parameters that allow the interface to be customised to the type of
    // field we're dealing with. Once we roll out support for custom field
    // types, this becomes a public API that must be documented thoroughly!
    let reference = fieldComponent.beforeReferenceSelect({
      api: currentApi,
      collection: currentCollection,
      field: referencedField
    })
    let instructionText = typeof fieldComponent.getInstructionText === 'function' ?
      fieldComponent.getInstructionText() :
      undefined
    let returnCtaText = typeof fieldComponent.getReturnCtaText === 'function' ?
      fieldComponent.getReturnCtaText() :
      undefined
    let toolbarActionText = typeof fieldComponent.getCtaText === 'function' ?
      fieldComponent.getCtaText(selectedDocuments) :
      `Add selected ${selectedDocuments.length > 1 ? 'documents' : 'document'}`

    let filters = Object.assign({}, reference.filter, search.filter)
    let fields = Object.keys(
      getVisibleFields({
        fields: reference.collection && reference.collection.fields,
        viewType: 'list'
      })
    ).concat(Constants.DEFAULT_FIELDS)

    return (
      <Page>
        <ReferenceSelectHeader
          collectionParent={currentCollection}
          onBuildBaseUrl={onBuildBaseUrl.bind(this)}
          documentId={documentId}
          instructionText={instructionText}
          referencedField={referencedField}
          returnCtaText={returnCtaText}
          returnCtaUrl={this.getRedirectUrl()}
        />
          
        <DocumentListController
          collection={reference.collection}
          enableFilters={true}
          onBuildBaseUrl={onBuildBaseUrl.bind(this)}
          referencedField={referencedField}
          search={search}
        />

        <Main>
          <DocumentList
            api={currentApi}
            collection={reference.collection}
            collectionParent={currentCollection}
            documentId={documentId}
            fields={fields}
            filters={filters}
            onBuildBaseUrl={onBuildBaseUrl.bind(this)}
            onPageTitle={setPageTitle}
            onRenderDocuments={this.handleRenderDocuments.bind(
              this,
              reference,
              fields
            )}
            onRenderEmptyDocumentList={this.handleEmptyDocumentList.bind(this)}
            order={order}
            page={page}
            referencedField={referencedField}
            sort={sort}
          />
        </Main>

        <DocumentListToolbar
          documentsMetadata={documents && documents.metadata}
          onBuildPageUrl={page => onBuildBaseUrl.call(this, {
            createNew: !Boolean(documentId),
            page,
            referenceFieldSelect: referencedField
          })}
        >
          <Button
            accent="save"
            disabled={!selectedDocuments.length}
            onClick={this.handleDocumentSelect.bind(this, fieldComponent)}
          >{toolbarActionText}</Button>
        </DocumentListToolbar>        
      </Page>
    )
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    documents: state.documents,
    router: state.router
  }),
  dispatch => bindActionCreators({
    ...documentActions,
    ...documentsActions
  }, dispatch)
)(ReferenceSelectView)
