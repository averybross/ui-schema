import React from 'react';
import AppTheme from './layout/AppTheme';
import Dashboard from './dashboard/Dashboard';
import {schemaWCombining} from '../schemas/demoCombining';
import {schemaWConditional, schemaWConditional1, schemaWConditional2} from '../schemas/demoConditional';
import {schemaWDep1, schemaWDep2} from '../schemas/demoDependencies';
import {dataDemoMain, schemaDemoMain, schemaUser} from '../schemas/demoMain';
import {schemaDemoReferencing, schemaDemoReferencingNetwork, schemaDemoReferencingNetworkB} from '../schemas/demoReferencing';
import {schemaSimString, schemaSimBoolean, schemaSimCheck, schemaSimNumber, schemaSimRadio, schemaSimSelect, schemaNull, schemaSimInteger} from '../schemas/demoSimples';
import {schemaGrid} from '../schemas/demoGrid';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import {GridContainer} from '@ui-schema/ds-material/GridContainer';
import {defineBinding} from '@ui-schema/ds-material/defineBinding';
import {getStandardPlugins} from '@ui-schema/ds-material/getStandardPlugins';
import {getCustomWidgets} from '@ui-schema/ds-material/getCustomWidgets';
import {getTypeWidgets} from '@ui-schema/ds-material/getTypeWidgets';
import {createOrderedMap, createMap} from '@ui-schema/react/Utils/createMap';
import {isInvalid} from '@ui-schema/react/ValidityReporter';
import {createStore, createEmptyStore, UIStoreProvider} from '@ui-schema/react/UIStore';
import {storeUpdater} from '@ui-schema/react/storeUpdater';
import {injectWidgetEngine} from '@ui-schema/react/applyWidgetEngine';
import {UIMetaProvider} from '@ui-schema/react/UIMeta';
import {MuiSchemaDebug} from './component/MuiSchemaDebug';
import {browserT} from '../t';
import {schemaLists} from '../schemas/demoLists';
import {schemaNumberSlider} from '../schemas/demoNumberSlider';
import {DummyRenderer} from './component/MuiMainDummy';
import {useDummy} from '../component/MainDummy';
import {UIApiProvider} from '@ui-schema/react/UIApi';
import {schemaDemoTable, schemaDemoTableAdvanced, schemaDemoTableMap, schemaDemoTableMapBig} from '../schemas/demoTable';
import {Table} from '@ui-schema/ds-material/Widgets/Table';
import {NumberRendererCell, StringRendererCell, TextRendererCell} from '@ui-schema/ds-material/Widgets/TextFieldCell';
import {TableAdvanced} from '@ui-schema/ds-material/Widgets/TableAdvanced';
import {InfoRenderer} from '@ui-schema/ds-material/Component/InfoRenderer';
import {SelectChips} from '@ui-schema/ds-material/Widgets/SelectChips';

const CustomTableBase = ({widgets, ...props}) => {
    const customWidgets = React.useMemo(() => ({
        ...widgets,
        types: {
            ...widgets.types,
            string: StringRendererCell,
            number: NumberRendererCell,
            integer: NumberRendererCell,
        },
        custom: {
            ...widgets.custom,
            Text: TextRendererCell,
        },
    }), [widgets])

    return <Table
        {...props}
        widgets={customWidgets}
    />
}
const CustomTable = React.memo(CustomTableBase)

const {widgetPlugins, schemaPlugins} = getStandardPlugins()
const customWidgets = defineBinding({
    InfoRenderer: InfoRenderer,
    widgetPlugins: widgetPlugins,
    schemaPlugins: schemaPlugins,
    types: getTypeWidgets(),
    custom: {
        ...getCustomWidgets(),
        SelectChips: SelectChips,
        Table: CustomTable,
        TableAdvanced: TableAdvanced,
    },
})
//widgets.types.null = () => 'null'

const GridStack = injectWidgetEngine(GridContainer)

const MainStore = () => {
    const [showValidity, setShowValidity] = React.useState(false);
    const [store, setStore] = React.useState(() => createStore(createMap(dataDemoMain)));
    const [schema, setSchema] = React.useState(() => createOrderedMap(schemaDemoMain));

    const onChange = React.useCallback((actions) => {
        setStore(prevStore => {
            const newStore = storeUpdater(actions)(prevStore)
            /*const newValue = newStore.getIn(prependKey(storeKeys, 'values'))
            const prevValue = prevStore.getIn(prependKey(storeKeys, 'values'))
            console.log(
                isImmutable(newValue) ? newValue.toJS() : newValue,
                isImmutable(prevValue) ? prevValue.toJS() : prevValue,
                storeKeys.toJS(),
                deleteOnEmpty, type,
            )*/
            return newStore
        })
    }, [setStore])

    return <React.Fragment>
        <UIStoreProvider
            store={store}
            onChange={onChange}
            showValidity={showValidity}
            //doNotDefault
        >
            <GridStack isRoot schema={schema}/>
            <MuiSchemaDebug setSchema={setSchema} schema={schema}/>
        </UIStoreProvider>

        <Button onClick={() => setShowValidity(!showValidity)}>validity</Button>
        {isInvalid(store.getValidity()) ? 'invalid' : 'valid'}

    </React.Fragment>
};

const DemoUser = () => {
    const [store, setStore] = React.useState(() => createEmptyStore());

    const onChange = React.useCallback((actions) => {
        setStore(storeUpdater(actions))
    }, [setStore])

    return <Grid container spacing={3} justify={'center'}>
        <Grid item xs={12} md={6}>
            <UIStoreProvider
                store={store}
                onChange={onChange}
                showValidity
            >
                <GridStack isRoot schema={schemaUser}/>
                <MuiSchemaDebug schema={schemaUser}/>
            </UIStoreProvider>
        </Grid>
    </Grid>
};

const loadSchema = (url, versions) => {
    console.log('Demo loadSchema (url, optional versions)', url, versions)
    return fetch(url).then(r => r.json())
}

const Main = ({classes = {}}) => {
    const {toggleDummy, getDummy} = useDummy();

    return <React.Fragment>
        <Grid item xs={12}>
            <DummyRenderer
                id={'schemaTableMap'} schema={schemaDemoTableMap}
                //open
                toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}
                stylePaper={{background: 'transparent'}} variant={'outlined'}
            />
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer
                id={'schemaTable'} schema={schemaDemoTable}
                //open
                toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}
                stylePaper={{background: 'transparent'}} variant={'outlined'}
            />
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer
                id={'schemaDemoTableMapBig'} schema={schemaDemoTableMapBig}
                //open
                toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}
                stylePaper={{background: 'transparent'}} variant={'outlined'}
            />
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer
                id={'schemaDemoTableAdvanced'} schema={schemaDemoTableAdvanced}
                //open
                toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}
                stylePaper={{background: 'transparent'}} variant={'outlined'}
            />
        </Grid>
        <Grid item xs={12}>
            <Paper className={classes.paper}>
                <MainStore/>
            </Paper>
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer
                id={'schemaReferencingNetwork'} schema={schemaDemoReferencingNetwork}
                toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}
                stylePaper={{background: 'transparent'}} variant={'outlined'}
            />
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer
                id={'schemaReferencingNetworkB'} schema={schemaDemoReferencingNetworkB}
                toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}
                stylePaper={{background: 'transparent'}} variant={'outlined'}
            />
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer id={'schemaReferencing'} schema={schemaDemoReferencing} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes} stylePaper={{background: 'transparent'}} variant={'outlined'}/>
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer id={'schemaNumberSlider'} schema={schemaNumberSlider} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer id={'schemaLists'} schema={schemaLists} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes} open/>
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer id={'schemaWCombining'} schema={schemaWCombining} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer id={'schemaWConditional'} schema={schemaWConditional} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer id={'schemaWConditional1'} schema={schemaWConditional1} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer id={'schemaWConditional2'} schema={schemaWConditional2} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer id={'schemaWDep1'} schema={schemaWDep1} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer id={'schemaWDep2'} schema={schemaWDep2} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer id={'schemaGrid'} schema={schemaGrid(12)} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer id={'schemaSimString'} schema={schemaSimString} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
            <DummyRenderer id={'schemaSimBoolean'} schema={schemaSimBoolean} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
            <DummyRenderer id={'schemaSimCheck'} schema={schemaSimCheck} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
            <DummyRenderer id={'schemaSimNumber'} schema={schemaSimNumber} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
            <DummyRenderer id={'schemaSimInteger'} schema={schemaSimInteger} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
            <DummyRenderer id={'schemaSimRadio'} schema={schemaSimRadio} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
            <DummyRenderer id={'schemaSimSelect'} schema={schemaSimSelect} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes}/>
        </Grid>
        <Grid item xs={12}>
            <DummyRenderer id={'schemaNull'} schema={schemaNull} toggleDummy={toggleDummy} getDummy={getDummy} classes={classes} stylePaper={{background: 'transparent'}} variant={'outlined'}/>
        </Grid>
        <Grid item xs={12}>
            <Button style={{marginBottom: 12}} onClick={() => toggleDummy('demoUser')} variant={getDummy('demoUser') ? 'contained' : 'outlined'}>
                demo User
            </Button>
            {getDummy('demoUser') ? <Paper className={classes.paper}>
                <DemoUser/>
            </Paper> : null}
        </Grid>
    </React.Fragment>
};

export default () => <AppTheme>
    <UIMetaProvider widgets={customWidgets} t={browserT}>
        <UIApiProvider loadSchema={loadSchema} noCache>
            <Dashboard main={Main}/>
        </UIApiProvider>
    </UIMetaProvider>
</AppTheme>;