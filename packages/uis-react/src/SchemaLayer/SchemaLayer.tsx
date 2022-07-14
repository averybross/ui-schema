import React from 'react'
import { AppliedWidgetEngineProps, applyWidgetEngine } from '@ui-schema/react/applyWidgetEngine'
import { useImmutable } from '@ui-schema/react/Utils/useImmutable'
import { UISchemaMap } from '@ui-schema/json-schema/Definitions'
import { WidgetProps } from '@ui-schema/react/Widgets'

export interface SchemaLayerProps {
    onSchema?: (schema: UISchemaMap) => void
}

const SchemaLayerGroupBase: React.ComponentType<AppliedWidgetEngineProps<{}, SchemaLayerProps & WidgetProps>> = ({schema, children, onSchema}) => {
    const currentSchema = useImmutable(schema)

    React.useEffect(() => {
        if (onSchema) {
            onSchema(currentSchema)
        }
    }, [onSchema, currentSchema])

    return children
}
export const SchemaLayer = applyWidgetEngine(SchemaLayerGroupBase)