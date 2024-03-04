const CircularLinkedlist = require('../src/CircularLinkedlist');
const list = new CircularLinkedlist();

let server1 = {host:'server1',ip:'10.1.1.1'};
let server2 = {host:'server2',ip:'10.1.1.2'};
let server3 = {host:'server3',ip:'10.1.1.3'};

list.push(server1);
list.push(server2);
// list.push('server3');
list.remove(server1);
list.push(server3);

const testSuite2 = () => {
    
    describe('revmove scenario', () => {
        test('List size is 2', () => {
            expect(list.getSize()).toBe(2)
        });
        test('node at the index:0 is Head node', () => {
            expect(list.getNodeAt(0)).toBe(list.head);
        })

        test('current node is tail node', () => {
            expect(list.next().item.host).toBe('server2');
        })

        test('current node is tail node', () => {
            expect(list.next().item.host).toBe('server3');
        })
        test('the next item of "server2"  is "server3"', () => {
            expect(list.getNodeAt(list.indexOf(server2)).next.item).toBe(server3);
        }) 
    })
}

module.exports = testSuite2;
