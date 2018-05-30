import PropTypes from 'prop-types';
import React from 'react';

import List from '../List';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    active: PropTypes.string,
    children: PropTypes.node,
    defaultHash: PropTypes.string,
    onClick: PropTypes.func,
    replaceHistory: PropTypes.bool,
    tabs: PropTypes.shape({
        dummy: PropTypes.string,
    }),
    useHash: PropTypes.bool,
    modifier: PropTypes.func,
};

const defaultProps = {
    active: undefined,
    children: null,
    className: '',
    defaultHash: undefined,
    onClick: () => {},
    replaceHistory: false,
    tabs: {},
    useHash: false,
    modifier: undefined,
};

export default class FixedTabs extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getNewHash = (tabs, defaultHash) => {
        if (defaultHash) {
            return `#/${defaultHash}`;
        }
        const keys = Object.keys(tabs);
        if (keys.length > 0) {
            return `#/${keys[0]}`;
        }
        return undefined;
    }

    constructor(props) {
        super(props);

        this.state = {
            hash: props.useHash ? this.getHash() : undefined,
        };
    }

    componentDidMount() {
        const { useHash } = this.props;

        if (useHash) {
            window.addEventListener('hashchange', this.handleHashChange);
            this.initializeHash(this.props);
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            tabs: oldTabs,
            useHash: oldUseHash,
        } = this.props;
        const {
            tabs: newTabs,
            defaultHash: newDefaultHash,
            useHash: newUseHash,
        } = nextProps;

        if (oldUseHash !== newUseHash) {
            if (newUseHash) {
                window.addEventListener('hashchange', this.handleHashChange);
                this.initializeHash(nextProps);
            } else if (oldUseHash) {
                window.removeEventListener('hashchange', this.handleHashChange);
                this.setState({ hash: undefined });
            }
        } else if (newUseHash && oldTabs !== newTabs) {
            this.initializeHash(nextProps);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.handleHashChange);
    }

    initializeHash = ({ tabs, defaultHash }) => {
        const { hash } = this.state;
        if (!hash || !tabs[hash]) {
            const hash = FixedTabs.getNewHash(
                tabs,
                defaultHash,
            );
            if (hash) {
                window.location.replace(hash);
            }
        }
    }

    getHash = () => (
        window.location.hash.substr(2)
    )

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            'fixed-tabs',
            styles.fixedTabs,
        ];

        return classNames.join(' ');
    }

    getTabClassName = (isActive) => {
        const classNames = [
            styles.tab,
            'fixed-tab',
        ];

        if (isActive) {
            classNames.push(styles.active);
            classNames.push('active');
        }

        return classNames.join(' ');
    }

    handleHashChange = () => {
        this.setState({ hash: this.getHash() });
    }

    handleTabClick = (key, e) => {
        const {
            onClick,
            useHash,
            replaceHistory,
        } = this.props;

        if (!useHash) {
            onClick(key);
            return;
        }

        if (replaceHistory) {
            window.location.replace(`#/${key}`);
            e.preventDefault();
        }
    }

    renderTab = (key, data) => {
        const {
            active,
            tabs,
            useHash,
            modifier,
        } = this.props;

        if (!tabs[data]) {
            return null;
        }

        const onClick = (e) => { this.handleTabClick(data, e); };
        const content = modifier ? modifier(data) : tabs[data];

        if (!useHash) {
            const isActive = data === active;
            const className = this.getTabClassName(isActive);

            return (
                <button
                    onClick={onClick}
                    className={className}
                    key={data}
                    type="button"
                >
                    { content }
                </button>
            );
        }

        const { hash } = this.state;

        const isActive = hash === data;
        const className = this.getTabClassName(isActive);

        return (
            <a
                onClick={onClick}
                href={`#/${data}`}
                className={className}
                key={data}
            >
                { content }
            </a>
        );
    }

    render() {
        const {
            tabs,
        } = this.props;

        const tabList = Object.keys(tabs);
        const className = this.getClassName();
        return (
            <div className={className}>
                <List
                    data={tabList}
                    modifier={this.renderTab}
                />
                <div className={styles.void}>
                    { this.props.children }
                </div>
            </div>
        );
    }
}
