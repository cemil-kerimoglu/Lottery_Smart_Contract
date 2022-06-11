const Lottery = artifacts.require("Lottery");

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Lottery', (accounts) =>  {
    let lottery

    before(async () => {
        lottery = await Lottery.new()
    })

    describe('Adding new players', async () => {
        
        it('adds new players', async () => {
            await lottery.addPlayer({from: accounts[0], value: web3.utils.toWei('0.1', 'ether')})
            lotteryParticipants = await lottery.getPlayers()
            assert.equal(lotteryParticipants[0], accounts[0], 'first player has been added')     

            await lottery.addPlayer({from: accounts[1], value: web3.utils.toWei('0.2', 'ether')})
            lotteryParticipants = await lottery.getPlayers()
            assert.equal(lotteryParticipants[1], accounts[1], 'second player has been added')  

            await lottery.addPlayer({from: accounts[2], value: web3.utils.toWei('0.08', 'ether')}).should.be.rejected

            await lottery.addPlayer({from: accounts[2], value: web3.utils.toWei('0.15', 'ether')})
            lotteryParticipants = await lottery.getPlayers()
            assert.equal(lotteryParticipants[2], accounts[2], 'third player has been added')  

            assert.equal(3, lotteryParticipants.length)
        })    
    })

    describe('Selecting the winner', async () => {
        
        it('has the correct balance', async () => {
            balance = await lottery.getBalance({from: accounts[0]})
            assert.equal(balance, web3.utils.toWei('0.45', 'ether'))
        })

        it('only allows the manager to view the balance', async () => {
            try {
              await lottery.getBalance({from: accounts[1]})
              assert(false)
            } catch(err) {
              assert(err)
            }
        })

        it('selects the winner among participants', async () => {
            await lottery.selectWinner({from: accounts[1]}).should.be.rejected

            await lottery.selectWinner({ from: accounts[0] })
            lotteryWinner = await lottery.winner()
            result = lotteryParticipants.includes(lotteryWinner)
            assert.equal(result.toString(), 'true')
        })
  
        it('transfers the money to the winner', async () => {
            winnerBalanceOld = await web3.eth.getBalance(lotteryWinner)
            await lottery.transferMoneyToWinner({from: accounts[1]}).should.be.rejected

            await lottery.transferMoneyToWinner({from: accounts[0]})
            winnerBalanceNew = await web3.eth.getBalance(lotteryWinner)
            assert.equal((winnerBalanceNew-winnerBalanceOld), web3.utils.toWei('0.45', 'ether'))

            balance = await lottery.getBalance({from: accounts[0]})
            assert.equal(balance, '0')
        })
        
    })


    
    





})