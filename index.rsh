'reach 0.1'

const General = {
  timeExpire: Fun([], Null),
  ...hasRandom
}

export const main = Reach.App(() => {
  const Alice = Participant('Alice', {
    deadline: UInt,
    payment: UInt,
    decideFortune: Fun([UInt], Bool),
    thankyou: Fun([], Null),
    ...General
  })
  const Bob = Participant('Bob', {
    acceptPayment: Fun([UInt], Null),
    receivePayment: Fun([UInt], Null),
    readFortune: Fun([], UInt),
    ...General
  })
  init()

  const timeExpire = () => {
    each([Alice,Bob], () => {
      interact.timeExpire()
    })
  }

  Alice.only(() => {
    const wager = declassify(interact.payment)
    const deadline = declassify(interact.deadline)
  })
  Alice.publish(wager, deadline)
      .pay(wager)
  commit()

  Bob.only(() => {
    interact.acceptPayment(wager)
  })
  Bob.pay(wager)
    .timeout(relativeTime(deadline), () => closeTo(Alice, timeExpire))

  var decision = false
  invariant(balance() == 2 * wager)
  while(decision == false){
    commit()
    
    Bob.only(() => {
      const fortune = declassify(interact.readFortune())
    })
    Bob.publish(fortune)
      .timeout(relativeTime(deadline), () => closeTo(Alice, timeExpire))
    commit()

    Alice.only(() => {
      const tof = declassify(interact.decideFortune(fortune))
    })    
    Alice.publish(tof)
        .timeout(relativeTime(deadline), () => closeTo(Bob, timeExpire))

    decision = tof
    continue
  }
  
  assert(decision == true)
  const fullPayment = 2 * wager
  transfer(fullPayment).to(Bob)
  Alice.only(() => {
    interact.thankyou()
  })
  Bob.only(() => {
    interact.receivePayment(fullPayment)
  })
  commit()
})