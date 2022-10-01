import React from 'react';
import PlayerViews from './PlayerViews';

const exports = {...PlayerViews};

exports.Wrapper = class extends React.Component {
  render() {
    const {content} = this.props;
    return (
      <div className="Attacher">
        <h2>Attacher (Bob)</h2>
        {content}
      </div>
    );
  }
}

exports.Attach = class extends React.Component {
  render() {
    const {parent} = this.props;
    const {ctcInfoStr} = this.state || {};
    return (
      <div>
        Please paste the contract info to attach to:
        <br />
        <textarea spellCheck="false"
          className='ContractInfo'
          onChange={(e) => this.setState({ctcInfoStr: e.currentTarget.value})}
          placeholder='{}'
        />
        <br />
        <button
          disabled={!ctcInfoStr}
          onClick={() => parent.attach(ctcInfoStr)}
        >Attach</button>
      </div>
    );
  }
}

exports.Attaching = class extends React.Component {
  render() {
    return (
      <div>
        Attaching, please wait...
      </div>
    );
  }
}

exports.AcceptTerms = class extends React.Component {
  render() {
    const {wager, standardUnit, parent} = this.props;
    const {disabled} = this.state || {};
    return (
      <div>
        The terms of the game are:
        <br /> Wager: {wager} {standardUnit}
        <br />
        <button
          disabled={disabled}
          onClick={() => {
            this.setState({disabled: true});
            parent.termsAccepted();
          }}
        >Accept terms and pay wager</button>
      </div>
    );
  }
}

exports.WaitingForTurn = class extends React.Component {
  render() {
    return (
      <div>
        Waiting for the other player...
        <br />Generating fortunes...
      </div>
    );
  }
}

exports.ReadFortune = class extends React.Component {
  render(){
    const {parent, playable, fortune} = this.props
    return(
      <div>
        {fortune ? 'Fortune is not true! Try Again.' : ''}
        <br />
        {!playable ? 'Please wait ... ' : ''}
        <br />
        <button
          disabled={!playable}
          onClick={() => parent.getFortune('ASmart')}
        >Alice is smart</button>
        <button
          disabled={!playable}
          onClick={() => parent.getFortune('ARich')}
        >Alice is rich</button>
        <button
          disabled={!playable}
          onClick={() => parent.getFortune('ABob')}
        >Alice is Bob</button>
      </div>
    )
  }
}

exports.CheckPayment = class extends React.Component {
  render(){
    const {payment} = this.props
    return (
      <div>
        Payment of {payment} has been received.
      </div>
    )
  }
}

export default exports;