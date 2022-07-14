import React from 'react'
import { List } from 'immutable'
import { memo } from '@ui-schema/react/Utils/memo'
import { useUIMeta } from '@ui-schema/react/UIMeta'
import { createValidatorErrors } from '@ui-schema/system/ValidatorErrors'
import { StoreKeys, useUIConfig } from '@ui-schema/react/UIStore'
import { useImmutable } from '@ui-schema/react/Utils/useImmutable'
import { WidgetEngineErrorBoundary, WidgetPluginProps, WidgetPluginType } from '@ui-schema/react/WidgetEngine'
import { UISchemaMap } from '@ui-schema/json-schema/Definitions'
import { AppliedWidgetEngineProps } from '@ui-schema/react/applyWidgetEngine'
import { WidgetOverrideType, WidgetProps, WidgetsBindingFactory } from '@ui-schema/react/Widgets'
import { WidgetRendererProps } from '@ui-schema/react/WidgetRenderer'

const errorContainer = createValidatorErrors()

export type WidgetEngineWrapperProps = {
    children: React.ReactNode
    schema: UISchemaMap
    storeKeys: StoreKeys
    schemaKeys: StoreKeys
}

export type WidgetEngineInjectProps = 'currentPluginIndex' | 'requiredList' | 'required' | 'errors' | 'valid' | 'storeKeys' | 'parentSchema'

export type WidgetEngineProps<PWidget extends {} = {}, C extends {} = {}, PWrapper extends {} = {}> = AppliedWidgetEngineProps<C, WidgetPluginProps> & {
    // level?: number

    // listen from a hoisted component for `errors` changing,
    // useful for some performance optimizes like at ds-material Accordions
    // onErrors?: onErrors

    // override widgets of MetaProvider for this particular WidgetEngine (passed down at some use cases)
    // widgets?: WidgetsBindingBase

    // override any widget for just this WidgetEngine, not passed down further on
    // better use `applyWidgetEngine` instead! https://ui-schema.bemit.codes/docs/core-pluginstack#applypluginstack
    // todo: actually `WidgetOverride` is a WidgetRenderer prop - and also passed through the plugins, so should be in PluginProps also - but not in WidgetProps
    WidgetOverride?: WidgetOverrideType<PWidget, C>

    // wraps the whole stack internally, as interfacing for the utility function `injectWidgetEngine`
    // only rendered when not "virtual"
    StackWrapper?: React.ComponentType<WidgetEngineWrapperProps & PWrapper>

    wrapperProps?: PWrapper


    // all other props are passed down to all rendering Plugins and the final widget
    // except defined `props` removed by `WidgetRenderer`: https://ui-schema.bemit.codes/docs/core-renderer#widgetrenderer
    // [key: string]: any
}

// `extractValue` has moved to own plugin `ExtractStorePlugin` since `0.3.0`
// `withUIMeta` and `mema` are not needed for performance optimizing since `0.3.0` at this position
export const WidgetEngine = <PWidget extends {} = {}, C extends {} = {}, P extends WidgetEngineProps<PWidget, C> = WidgetEngineProps<PWidget, C>>(
    {StackWrapper, wrapperProps, ...props}: P & PWidget
): React.ReactElement => {
    const {widgets, ...meta} = useUIMeta()
    const config = useUIConfig()
    const {
        level = 0,
        parentSchema,
        storeKeys = List([]),
        schemaKeys = List([]),
        schema,
        widgets: customWidgets,
        // todo: fix typing of `WidgetEngineProps`
    } = props as unknown as WidgetProps
    // central reference integrity of `storeKeys` for all plugins and the receiving widget, otherwise `useImmutable` is needed more times, e.g. 3 times in plugins + 1x time in widget
    const currentStoreKeys = useImmutable(storeKeys)
    const currentSchemaKeys = useImmutable(schemaKeys)
    const activeWidgets = customWidgets || widgets

    const isVirtual = Boolean(props.isVirtual || schema?.get('hidden'))
    let required = List([])
    if (parentSchema) {
        // todo: resolving `required` here is wrong, must be done after merging schema / resolving referenced
        //      ! actual, it is correct here, as using `parentSchema`
        const tmp_required = parentSchema.get('required')
        if (tmp_required) {
            required = tmp_required
        }
    }

    const stack =
        <NextPluginRenderer
            {...meta}
            {...config}
            {...props}
            currentPluginIndex={-1}
            widgets={activeWidgets}
            level={level}
            storeKeys={currentStoreKeys}
            schemaKeys={currentSchemaKeys}
            requiredList={required}
            required={false}
            errors={errorContainer}
            isVirtual={isVirtual}
            valid
        />

    const wrappedStack = StackWrapper && !isVirtual ?
        <StackWrapper
            schema={schema}
            storeKeys={currentStoreKeys}
            schemaKeys={currentSchemaKeys}
            {...(wrapperProps || {})}
        >{stack}</StackWrapper> :
        stack

    return props.schema ?
        activeWidgets?.ErrorFallback ?
            <WidgetEngineErrorBoundary
                FallbackComponent={activeWidgets.ErrorFallback}
                type={schema.get('type')}
                widget={schema.get('widget')}
                storeKeys={currentStoreKeys}
            >
                {wrappedStack}
            </WidgetEngineErrorBoundary> :
            wrappedStack :
        null as unknown as React.ReactElement
}

export const getNextPlugin = <C extends {} = {}, W extends WidgetsBindingFactory = WidgetsBindingFactory>(
    next: number,
    {widgetPlugins: wps, WidgetRenderer}: W
): WidgetPluginType<C, W> | React.ComponentType<WidgetRendererProps<W>> =>
    wps && next < wps.length ?
        wps[next] as WidgetPluginType<C, W> // todo: throw exception here, was: || (() => 'plugin-error') :
        : WidgetRenderer as React.ComponentType<WidgetRendererProps<W>>

export const NextPluginRenderer = <P extends WidgetPluginProps>({currentPluginIndex, ...props}: P): React.ReactElement => {
    const next = currentPluginIndex + 1
    const Plugin = getNextPlugin(next, props.widgets)
    return <Plugin {...props} currentPluginIndex={next}/>
}
export const NextPluginRendererMemo = memo(NextPluginRenderer) as <P extends WidgetPluginProps>(props: P) => React.ReactElement