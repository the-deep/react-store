/**
 * @author tnagorra <weathermist@gmail.com>
 */
import PropTypes from 'prop-types';
import React from 'react';

import {
    accumulateValues,
    accumulateErrors,
    accumulateDifferentialErrors,
    analyzeErrors,
} from './validator';
import computeOutputs from './computer';
import FaramGroup from '../FaramGroup';
import styles from './styles.scss';

const noOp = () => {};

const propTypes = {
    /* class name for styling */
    className: PropTypes.string,
    /* children of the form */
    children: PropTypes.node.isRequired, // eslint-disable-line

    /* schema for validation */
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    /* schema for calculation */
    computeSchema: PropTypes.objectOf(PropTypes.any),
    /* fn to be called when value of any element change */
    onChange: PropTypes.func,
    /* fn to be called when form validation fails */
    onValidationFailure: PropTypes.func,
    /* fn to be called when form validation succeds */
    onValidationSuccess: PropTypes.func,

    /* object with values */
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    /* Error for every field of form */
    error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    /* Disable all elements in form */
    disabled: PropTypes.bool,
    /* Delay every input component in form */
    changeDelay: PropTypes.number,

    /* Submit method setter to use externally */
    setSubmitFunction: PropTypes.func,
};

const defaultProps = {
    className: '',
    onChange: noOp,
    onValidationFailure: noOp,
    onValidationSuccess: noOp,
    disabled: false,
    changeDelay: 300, // ms
    computeSchema: {},
    value: {},
    error: {},
    setSubmitFunction: undefined,
};

const handleSubmit = (value, schema, onValidationFailure, onValidationSuccess) => {
    const errors = accumulateErrors(value, schema);
    const hasErrors = analyzeErrors(errors);

    if (hasErrors) {
        onValidationFailure(errors);
        return value;
    }

    const values = accumulateValues(
        value,
        schema,
        { noFalsyValues: true },
    );

    const valuesWithNull = accumulateValues(
        value,
        schema,
        {
            noFalsyValues: false,
            falsyValue: null,
        },
    );
    onValidationSuccess(valuesWithNull, values);
    return values;
};


/*
 * Form Component for field validations and values aggregation
 */
export default class Faram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        const { setSubmitFunction } = this.props;
        if (setSubmitFunction) {
            setSubmitFunction(this.submit);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.changeTimeout);
        const { setSubmitFunction } = this.props;
        if (setSubmitFunction) {
            setSubmitFunction(undefined);
        }
    }

    // NOTE:
    // Submit method that can be called externally
    // Use detachedFaram instead of calling submit externally
    submit = () => {
        clearTimeout(this.changeTimeout);

        const {
            disabled,
            changeDelay,
        } = this.props;

        if (disabled) {
            return;
        }

        // Add some delay to submit
        this.changeTimeout = setTimeout(
            () => {
                const {
                    value,
                    schema,
                    onValidationFailure,
                    onValidationSuccess,
                } = this.props;
                this.lastValue = handleSubmit(
                    value,
                    schema,
                    onValidationFailure,
                    onValidationSuccess,
                );
            },
            changeDelay,
        );
    }

    // Submit using submit button

    handleSubmitClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        this.submit();

        // NOTE: Returning false will not submit & redirect
        return false;
    }

    handleFormChange = (value, info) => {
        const {
            onChange,
            computeSchema,
            schema,
            value: oldValue,
            error: oldError,
        } = this.props;

        const newValue = computeOutputs(value, computeSchema);
        const newError = accumulateDifferentialErrors(
            oldValue,
            newValue,
            oldError,
            schema,
        );

        // FIXME:
        // this.valueSent = newValue;
        onChange(newValue, newError, info);
    }

    render() {
        const {
            children,
            className,
            value,
            error,
            disabled,
            changeDelay,
        } = this.props;

        return (
            <form
                className={`${className} ${styles.form}`}
                onSubmit={this.handleSubmitClick}
                noValidate
            >
                <FaramGroup
                    onChange={this.handleFormChange}
                    value={value}
                    error={error}
                    disabled={disabled}
                    changeDelay={changeDelay}
                >
                    {children}
                </FaramGroup>
            </form>
        );
    }
}

export const detachedFaram = ({
    value,
    schema,
    // computeSchema,
    // onChange,
    onValidationFailure,
    onValidationSuccess,
}) => {
    // NOTE: Faram may not be mounted so we need to trigger computation here
    // handleValueChange(value, schema, computeSchema, onChange);

    handleSubmit(value, schema, onValidationFailure, onValidationSuccess);
};

export * from './validations';
