import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { removeAlert } from '../../actions';
import './Alerts.scss';

function Alerts({ alerts, removeAlert }) {
    var lastAlert = alerts[alerts.length - 1];
    useEffect(() => {
        lastAlert && setTimeout(() => removeAlert(lastAlert.id), 3000);
    }, [lastAlert && lastAlert.id]); // eslint-disable-line react-hooks/exhaustive-deps

    return <div className="Alerts">
        <ul>{alerts.map((a, i) => <li className={a.style} key={a.id}>{a.text}</li>)}</ul>
    </div>;
}

const mapStateToProps = state => ({
    alerts: state.alerts.list
});

const mapDispatchToProps = dispatch => ({
    removeAlert: id => dispatch(removeAlert(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(Alerts);