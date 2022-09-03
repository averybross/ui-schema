import React from 'react'
import { WidgetPluginType } from '@ui-schema/react/WidgetEngine'
import { UISchemaMap } from '@ui-schema/json-schema/Definitions'
import { WidgetProps } from '@ui-schema/react/Widgets'
import { WidgetRendererProps } from '@ui-schema/react/WidgetRenderer'
import { SchemaPlugin } from '@ui-schema/system/SchemaPlugin'
import { StoreKeys, WithValue } from '@ui-schema/react/UIStore'
import { List } from 'immutable'
import { WidgetsBindingRoot } from '@ui-schema/system/WidgetsBinding'

export interface NoWidgetProps {
    storeKeys: StoreKeys
    schemaKeys?: StoreKeys
    scope?: string
    matching?: string
}

export interface GroupRendererProps {
    storeKeys: StoreKeys
    schemaKeys?: StoreKeys
    level: number
    schema: UISchemaMap
    noGrid?: boolean
    style?: {}
    className?: string
    spacing?: number
}

export interface ErrorFallbackProps {
    error: any | null
    storeKeys: StoreKeys
    type?: string | List<string>
    widget?: string
}

export interface WidgetsBindingComponents {
    ErrorFallback?: React.ComponentType<ErrorFallbackProps>
    // wraps any `object` that has no custom widget
    GroupRenderer: React.ComponentType<GroupRendererProps>
    // final widget matching and rendering
    WidgetRenderer: React.ComponentType<WidgetRendererProps>
    // if using `isVirtual` for no-output based rendering
    VirtualRenderer: React.ComponentType<WidgetProps & WithValue>
    // if no widget can be matched
    NoWidget: React.ComponentType<NoWidgetProps>
    // widget plugin system (react components)
    widgetPlugins?: WidgetPluginType[]
    // props plugin system (vanilla JS functions based)
    schemaPlugins?: SchemaPlugin[]

    // actual validator function to use outside of render flow (in functions)
    // > added in `0.3.0`
    // validator: () => void
}

/**
 * widget binding
 * - `C` = own `UIMetaContext` definition
 * - `TW` = own type widgets definition
 * - `CW` = own custom widgets definition
 */
export type WidgetsBindingFactory<W extends {} = {}, TW extends {} = {}, CW extends {} = {}> =
    WidgetsBindingComponents & W &
    WidgetsBindingRoot<TW, CW>
