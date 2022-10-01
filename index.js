import React from 'react'
import AppViews from './views/AppViews'
import AttacherViews from './views/AttacherViews'
import DeployerViews from './views/DeployerViews'
import { renderDOM, renderView } from './views/render'
import './index.css'
import * as backend from './build/index.main.mjs'
import { loadStdlib } from '@reach-sh/stdlib'
const reach = loadStdlib(process.env)

import { ALGO_MyAlgoConnect as MyAlgoConnect }
  from '@reach-sh/stdlib'
reach.setWalletFallback(reach.walletFallback({
  providerEnv: 'TestNet', MyAlgoConnect
}))

const fortuneToInt = {'ASmart':0, 'ARich':1, 'ABob':2}
const intToFortune = ['Alice is smart', 'Alice is rich', 'Alice is Bob']
const decisionToInt = {'FALSE':0, 'TRUE':1}
const intToBool = [false, true]
const {standardUnit} = reach
const defaults = {defaultFundAmt: '10', defaultWager: '5', standardUnit}

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {view: 'ConnectAccount', ...defaults}
  }
  async componentDidMount(){
    const acc = await reach.getDefaultAccount()
    const balAtomic = await reach.balanceOf(acc)
    const bal = reach.formatCurrency(balAtomic,4)
    this.setState(({acc, bal}))
    if(await reach.canFundFromFaucet()){
      this.setState({view: 'FundAccount'})
    } else{
      this.setState({view: 'DeployerOrAttacher'})
    }
  }
  async fundAccount(fundAmount) {
    await reach.fundFromFaucet(this.state.acc, reach.parseCurrency(fundAmount))
    this.setState({view: 'DeployerOrAttacher'})
  }
  async skipFundAccount() {
    this.setState({view: 'DeployerOrAttacher'})
  }
  selectAttacher() { this.setState({view: 'Wrapper', ContentView: Attacher})}
  selectDeployer() { this.setState({view: 'Wrapper', ContentView: Deployer})}
  render() { return renderView(this, AppViews) }
}

class General extends React.Component {
  random() { reach.hasRandom.random() }
  timeExpire() { this.setState({view: 'Timeout'})}
}

class Deployer extends General {
  constructor(props) {
    super (props)
    this.state = {view: 'SetWager'}
  }
  setWager(wager) { this.setState({view: 'Deploy', wager})}
  async deploy() {
    const ctc = this.props.acc.contract(backend)
    this.setState({view: 'Deploying', ctc})
    this.payment = reach.parseCurrency(this.state.wager)
    this.deadline = {ETH:100, ALGO:100, CFX:1000}[reach.connector]
    backend.Alice(ctc, this)
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2)
    this.setState({view: 'WaitingForAttacher', ctcInfoStr})
  }
  
  async decideFortune(ftn) {
    const decision = await new Promise(resolveDecP => {
      this.setState({view: 'DecideFortune', playable:true, fortunes: intToFortune[ftn],resolveDecP})
    })
    this.setState({view: 'WaitingForResults', decision})
    return intToBool[decisionToInt[decision]]
  }
  getDecision(decision){ this.state.resolveDecP(decision) }
  thankyou() { this.setState({view: 'ThankYou'}) }

  render() { return renderView(this, DeployerViews)}
}

class Attacher extends General {
  constructor(props){
    super(props)
    this.state = {view: 'Attach'}
  }
  attach(ctcInfoStr) {
    const ctc = this.props.acc.contract(backend, JSON.parse(ctcInfoStr))
    this.setState({view: 'Attaching'})
    backend.Bob(ctc, this)
  }
  async acceptPayment(wagerAtomic) {
    const wager = reach.formatCurrency(wagerAtomic,4)
    return await new Promise(resolveAcceptedP => {
      this.setState({view: 'AcceptTerms', wager, resolveAcceptedP})
    })
  }
  termsAccepted() {
    this.state.resolveAcceptedP()
    this.setState({view: 'WaitingForTurn'})
  }
  async readFortune() {
    const fortune = await new Promise(reoslveFortuneP => {
      this.setState({view: 'ReadFortune', playable: true, reoslveFortuneP})
    })
    this.setState({view: 'WaitingForResults', fortune})
    return fortuneToInt[fortune]
  }
  getFortune(fortune) { this.state.reoslveFortuneP(fortune)}
  receivePayment(payment) {
    const fullPayment = reach.formatCurrency(payment,4)
    this.setState({view: 'CheckPayment', payment:fullPayment})
  }
  render() { return renderView(this, AttacherViews) }
}

renderDOM(<App />)