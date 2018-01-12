import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import { singleColors } from '../../../utils/ColorScheme';
import OrgChart from '../OrgChart';

import { SelectInput } from '../../Input';
import { PrimaryButton } from '../../Action';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class OrgChartView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            selectColor: undefined,
            fillColor: undefined,
        };

        this.colors = singleColors.map(color => ({
            id: color,
            title: color,
        }));
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            selectColor: newProps.selectcolor,
            fillColor: newProps.fillColor,
            selectedItems: [],
        });
    }

    fillColor = (data) => {
        this.setState({
            fillColor: data,
        });
    }

    selectColor = (data) => {
        this.setState({
            selectColor: data,
        });
    }

    handleSelection = (items) => {
        this.setState({
            selectedItems: items,
        });
    }

    handleSave = () => {
        this.chart.wrappedComponent.save();
    }

    render() {
        const {
            className,
            ...otherProps
        } = this.props;

        return (
            <div
                styleName="orgchart-view"
                className={className}
            >
                <div styleName="action">
                    <div styleName="action-selects">
                        <SelectInput
                            clearlable={false}
                            keySelector={d => d.title}
                            labelSelector={d => d.title}
                            onChange={this.fillColor}
                            options={this.colors}
                            showHintAndError={false}
                            styleName="select-input"
                            value={this.state.fillColor}
                        />
                        <SelectInput
                            clearlable={false}
                            keySelector={d => d.title}
                            labelSelector={d => d.title}
                            onChange={this.selectColor}
                            options={this.colors}
                            showHintAndError={false}
                            styleName="select-input"
                            value={this.state.selectColor}
                        />
                    </div>
                    <div styleName="action-buttons">
                        <PrimaryButton onClick={this.handleSave}>
                            Save
                        </PrimaryButton>
                    </div>
                </div>
                <OrgChart
                    styleName="orgchart"
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                    selectColor={this.state.selectColor}
                    fillColor={this.state.fillColor}
                    onSelection={this.addValues}
                    value={this.state.selectedItems}
                />
            </div>
        );
    }
}
