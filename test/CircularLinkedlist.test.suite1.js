const CircularLinkedlist = require('../src/CircularLinkedlist');

const list = new CircularLinkedlist();

let server1 = {host:'server1',ip:'10.1.1.1',port:1234};
let server2 = {host:'server2',ip:'10.1.1.2',port:1234};
let server3 = {host:'server3',ip:'10.1.1.3',port:1234};

list.push(server1)
list.push(server1)
list.push(server2)
list.push(server3)

const testSuite1 = () => {
    describe('push scenario', () => {
        test('List size is 3', () => {
            expect(list.getSize()).toBe(3);
        })

        test('item at the index:1 is "server2"', () => {
            expect(list.getNodeAt(1).item.ip).toBe('10.1.1.2');
        })

        test('node at the index:0 is Head node', () => {
            expect(list.getNodeAt(0)).toBe(list.head);
        })

        test('current node is tail node', () => {
            expect(list.current).toBe(list.tail);
        })

        test('the next item of "server2"  is "server3"', () => {
            expect(list.getNodeAt(list.indexOf(server2)).next.item).toBe(server3);
        })      

    })
}

module.exports = testSuite1;

