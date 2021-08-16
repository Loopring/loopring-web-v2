import styled from '@emotion/styled';
import { Meta, Story } from '@storybook/react/types-6-0';
import { MemoryRouter } from 'react-router-dom';
import { Box, Grid } from '@material-ui/core';
// import { useTranslation } from 'react-i18next';
// import { useDispatch } from 'react-redux';
import { FilterMarketPanel } from './FilterMarketsPanel';

const Style = styled.div`
  background: var(--color-global-bg);
  color: #fff;
  height: 100%;
  flex: 1
`
const FilterMarketPanelWrap = () => {
    return <FilterMarketPanel/>
}

const Template: Story<any> = () => {
    // const dispatch = useDispatch();
    // const {t} = useTranslation('common');
    return <Style> <MemoryRouter initialEntries={['/']}>
        <Box>
            <h4>Panel</h4>
            <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
                <FilterMarketPanelWrap/>
            </Grid>

        </Box>
    </MemoryRouter>
    </Style>
};

export default {
    title: 'components/Panel',
    component: FilterMarketPanel,
    argTypes: {},
} as Meta

export const PanelsStory = Template.bind({});
// SwitchPanel.args = {}
