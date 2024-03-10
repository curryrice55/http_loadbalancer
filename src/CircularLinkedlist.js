//https://www.sahinarslan.tech/posts/deep-dive-into-data-structures-using-javascript-circular-linked-list
//https://medium.com/before-semicolon/linked-list-in-javascript-circular-and-reversed-list-4376980f6568
class CircularLinkedList {
    constructor() {
        this.size = 0;      //The size(length) of CircularLinkedList
        this.head = null;   //The start Node of the list. Node1(head) => Node2 => Node3(tail) => Node1(head) =>...
        this.tail = null;   //The end Node of the list.
        this.current = null;
    }

    getSize() {
        return this.size;
    }

    createNode(item) {
        return { item, next: null }   //Node consists of (Node1)|item|next| => (Node2)|item|next| =>...
    }

    push(item) {
        const index = this.indexOf(item);
        if (index !== -1) return -1;        //If the item alreay exsists at the list, skip this process.

        const node = this.createNode(item);
        if (!this.head) this.head = node;   //If head node does not exist, we apply this node for head.
        else this.tail.next = node;         //Otherwise, set the next of the tail node to this node.

        this.tail = node;
        this.tail.next = this.head;
        this.size++;
        this.current = this.tail;
    }

    getCurrentNode() {
        if (!this.current) return -1;
        return this.current;
    }

    next() {
        if (!this.current) return -1;
        this.current = this.current.next;
        return this.current;
    }

    //Get item at specific index
    getNodeAt(index) {
        if (index >= 0 && index < this.size) {
            let node = this.head;
            for (let i = 0; i < index && node != null; i++) {
                node = node.next;
            }
            return node;
        }
        return -1;
    }

    //Get the indexOf item
    indexOf(item) {
        let current = this.head;
        let index = 0;
        while (current) {
            // Check if all keys in the item match the current node's item
            const isMatch = Object.keys(item).every((key) => current.item[key] === item[key]);
            if (isMatch) {
                return index;
            }
            index++;
            if (current === this.tail) return -1;
            current = current.next;
        }
        return -1;
    }

    remove(item) {
        //Get the index of the item
        const index = this.indexOf(item);
        if (index === -1) return -1;

        //Get the target delete node
        const target = this.getNodeAt(index);
        if (target === -1) return -1;
    
        //If Target delete node is 'Head'
        if (index === 0) {  
            //if the size =1, delete the node as Head/Tail
            if (this.size === 1) {    
                this.head = null;
                this.tail = null;
                this.current = null;
            } else {
                this.head = target.next;      //Changes Head refernece to Next of the target.
                this.tail.next = target.next; //The referrence of the Tail Node changes from Head to Next Head. 
            }   
        //If Target delete node is 'Tail'
        } else if (index === this.size - 1) { 
            const previous = this.getNodeAt(index - 1); //The previous Node of the target(Tail Node).
            this.tail = previous; //Changes Tail refernece from target to Previous of the target.
            previous.next = target.next; //The referrence of the Next of the previous Node changes from target to the next of the target. 
        //If Target delete node is 'Middle'
        } else{
            const previous = this.getNodeAt(index - 1);   //The previous Node of the target.
            previous.next = target.next;                  //The referrence of the Next of the previous Node changes from target to the next of the target. 
        }
        this.size--
        this.current = this.tail;
        return target; 
    }

    toArray() {
        let arr = [];
        let current = this.head;
        if (this.size === 0) {
            return arr;
        }
        while (true) {
            arr.push(current.item);
            if (current === this.tail) {
                break;
            }
            current = current.next;
        }
        return arr;
    }

    contains(item) {
        return this.indexOf(item) !== -1;
    }
}

module.exports = CircularLinkedList;