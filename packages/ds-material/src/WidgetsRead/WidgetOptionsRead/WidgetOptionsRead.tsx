import React, { MouseEventHandler } from 'react'
import { List } from 'immutable'
import { Trans } from '@ui-schema/ui-schema/Translate'
import { memo } from '@ui-schema/ui-schema/Utils/memo'
import { useUIMeta } from '@ui-schema/ui-schema/UIMeta'
import { StoreKeys, extractValue, WithScalarValue } from '@ui-schema/ui-schema/UIStore'
import { WidgetProps } from '@ui-schema/ui-schema/Widget'
import { StoreSchemaType } from '@ui-schema/ui-schema/CommonTypings'
import { ValidityHelperText } from '@ui-schema/ds-material/Component/LocaleHelperText'
import { MuiWidgetBinding } from '@ui-schema/ds-material/widgetsBinding'
import Box from '@mui/material/Box'
import { TitleBoxRead } from '@ui-schema/ds-material/Component/TitleBoxRead'
import Typography from '@mui/material/Typography'
import { UIMetaReadContextType } from '@ui-schema/ui-schema/UIMetaReadContext'
import { OptionValueSchema, useOptionsFromSchema } from '@ui-schema/ds-material'

const checkActive = (list: List<any>, name: string | undefined | number) => list && list.contains && typeof list.contains(name) !== 'undefined' ? list.contains(name) : false

const MultiOptionsItemsBase: React.ComponentType<{
    storeKeys: StoreKeys
    valueSchemas?: List<OptionValueSchema>
    schema: StoreSchemaType
    dense: boolean
    value?: any
}> = (
    {
        valueSchemas, value, dense,
    },
) => {
    const activeValueSchemas = valueSchemas?.filter(v => checkActive(value, v.value))
    return activeValueSchemas?.size ?
        activeValueSchemas.map(({schema, text, fallback, context}, i) => {
            return <Typography
                variant={dense ? 'body2' : 'body1'}
                style={{paddingRight: i < (activeValueSchemas.size - 1) ? 4 : 0}}
                key={i}
            >
                <Trans
                    schema={schema?.get('t') as unknown as StoreSchemaType}
                    text={text}
                    context={context}
                    fallback={fallback}
                />
                {i < (activeValueSchemas.size - 1) ? ', ' : ''}
            </Typography>
        }).valueSeq() as unknown as React.ReactElement :
        <Typography variant={dense ? 'body2' : 'body1'} style={{opacity: 0.65}}>-</Typography>
}

const MultiOptionsItems = extractValue(memo(MultiOptionsItemsBase))

const SingleOptionItem: React.ComponentType<{
    storeKeys: StoreKeys
    valueSchemas?: List<OptionValueSchema>
    dense: boolean
    value?: any
}> = (
    {valueSchemas, dense, value},
) => {
    const activeSchema = typeof value === 'undefined' ? undefined : valueSchemas?.find(s => s.value === value)

    return <Typography variant={dense ? 'body2' : 'body1'} color={activeSchema ? undefined : 'error'}>
        {activeSchema && typeof value !== 'undefined' ?
            <Trans
                schema={activeSchema.schema?.get('t')}
                text={activeSchema.text}
                context={activeSchema.context}
                fallback={activeSchema.fallback}
            /> :
            <span style={{opacity: 0.65}}>-</span>}
    </Typography>
}

export interface WidgetOptionsReadProps {
    onClick?: MouseEventHandler<HTMLDivElement> | undefined
    style?: React.CSSProperties
}

export const WidgetOptionsRead: React.ComponentType<WidgetProps<MuiWidgetBinding> & WithScalarValue & WidgetOptionsReadProps> = (
    {
        schema, storeKeys, showValidity,
        valid, errors, value,
        widgets,
        onClick, style,
    }
) => {
    const hideTitle = schema.getIn(['view', 'hideTitle']) as boolean | undefined
    const InfoRenderer = widgets?.InfoRenderer
    const hasInfo = Boolean(InfoRenderer && schema?.get('info')) as boolean | undefined
    const {readDense} = useUIMeta<UIMetaReadContextType>()
    const isMultiOption = Boolean(schema.get('items'))
    const {valueSchemas} = useOptionsFromSchema(
        storeKeys,
        schema.get('items') ? schema.get('items') as StoreSchemaType : schema,
    )
    return <Box onClick={onClick} style={style} tabIndex={onClick ? 0 : undefined}>
        <TitleBoxRead
            hideTitle={hideTitle}
            hasInfo={hasInfo}
            InfoRenderer={InfoRenderer}
            valid={valid}
            errors={errors}
            storeKeys={storeKeys}
            schema={schema}
        />

        <Box style={{display: 'flex', flexWrap: 'wrap'}}>
            {isMultiOption ?
                <MultiOptionsItems
                    valueSchemas={valueSchemas}
                    storeKeys={storeKeys}
                    schema={schema}
                    dense={Boolean(readDense)}
                /> :
                <SingleOptionItem
                    valueSchemas={valueSchemas}
                    storeKeys={storeKeys}
                    dense={Boolean(readDense)}
                    value={value}
                />}
        </Box>

        <ValidityHelperText errors={errors} showValidity={showValidity} schema={schema}/>
    </Box>
}
