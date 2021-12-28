import React from 'react'
import { beautifyKey, extractValue, memo, sortScalarList, StoreSchemaType, Trans, tt, WidgetProps, WithValue } from '@ui-schema/ui-schema'
import { TransTitle } from '@ui-schema/ui-schema/Translate/TransTitle'
import { ValidityHelperText } from '@ui-schema/ds-material/Component/LocaleHelperText/LocaleHelperText'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'
import Box from '@material-ui/core/Box'
import { MuiWidgetBinding } from '@ui-schema/ds-material/widgetsBinding'
import { List, Map, OrderedMap } from 'immutable'

export const SelectChipsBase: React.ComponentType<WidgetProps<{}, MuiWidgetBinding> & WithValue> = (
    {
        storeKeys, ownKey, schema, value, onChange,
        showValidity, errors, required,
        valid,
    }
) => {
    if (!schema) return null

    const oneOfVal = schema.getIn(['items', 'oneOf'])
    if (!oneOfVal) return null

    const currentValue = (typeof value !== 'undefined' ? value : (List(schema.get('default')) || List())) as List<string>

    return <Box>
        <Typography color={showValidity && !valid ? 'error' : undefined}>
            <TransTitle schema={schema} storeKeys={storeKeys} ownKey={ownKey}/>
        </Typography>

        <Box mt={1} style={{display: 'flex', flexWrap: 'wrap'}}>
            {oneOfVal ? (oneOfVal as List<OrderedMap<string, string>>).map((oneOfSchema) =>
                <Chip
                    key={oneOfSchema.get('const')}
                    label={<Trans
                        schema={oneOfSchema.get('t') as unknown as StoreSchemaType}
                        text={oneOfSchema.get('title') || storeKeys.insert(0, 'widget').push('title').join('.')}
                        context={Map({'relative': List(['title'])})}
                        fallback={oneOfSchema.get('title') || beautifyKey(oneOfSchema.get('const') as string | number, oneOfSchema.get('tt') as tt)}
                    />}
                    style={{marginRight: 4, marginBottom: 4}}
                    size={'small'}
                    variant={
                        currentValue?.indexOf(oneOfSchema.get('const') as string) === -1 ? 'outlined' : 'default'
                    }
                    color={'primary'}
                    onClick={() => {
                        !schema.get('readOnly') &&

                        onChange({
                            storeKeys,
                            scopes: ['value'],
                            type: 'update',
                            schema,
                            required,
                            updater: ({value = List()}: { value?: List<string> }) => ({
                                value: value.indexOf(oneOfSchema.get('const') as string) === -1 ?
                                    sortScalarList(value.push(oneOfSchema.get('const') as string)) :
                                    sortScalarList(value.splice(value.indexOf(oneOfSchema.get('const') as string), 1)),
                            }),
                        })
                    }}
                />
            ).valueSeq() : null}
        </Box>

        <ValidityHelperText errors={errors} showValidity={showValidity} schema={schema}/>
    </Box>
}

export const SelectChips = extractValue(memo(SelectChipsBase))
