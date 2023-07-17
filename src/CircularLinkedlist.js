//https://www.sahinarslan.tech/posts/deep-dive-into-data-structures-using-javascript-circular-linked-list
//https://medium.com/before-semicolon/linked-list-in-javascript-circular-and-reversed-list-4376980f6568
class CircularLinkedList {
    constructor() {
        //The size(length) of CircularLinkedList
        this.size = 0; 
        //The start Node of the list. Node1(head) => Node2 => Node3(tail) => Node1(head) =>...     
        this.head = null; 
        //The end Node of the list. 
        this.tail = null;   
        this.current = null;
    }

    getSize() {
        return this.size;
    }

    createNode(item) {
        //Node consists of (Node1)|item|next| => (Node2)|item|next| =>...
        return { item, next: null }  
    }

    push(item) {
        const index = this.indexOf(item);
        //If the item alreay exsists at the list, skip this process.
        if (index !== -1) return -1;       

        const node = this.createNode(item);
        //If head node does not exist, we apply this node for head.
        if (!this.head) this.head = node;
        //Otherwise, set the next of the tail node to this node.
        else this.tail.next = node;         

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
                //Changes Head refernece to Next of the target.
                this.head = target.next; 
                //The referrence of the Tail Node changes from Head to Next Head.     
                this.tail.next = target.next;  
            }   
        //If Target delete node is 'Tail'
        } else if (index === this.size - 1) { 
            //The previous Node of the target(Tail Node).
            const previous = this.getNodeAt(index - 1); 
            //Changes Tail refernece from target to Previous of the target.
            this.tail = previous; 
             //The referrence of the Next of the previous Node changes from target to the next of the target. 
            previous.next = target.next;
            
        //If Target delete node is 'Middle'
        } else{
            //The previous Node of the target.
            const previous = this.getNodeAt(index - 1);  
            //The referrence of the Next of the previous Node changes from target to the next of the target.  
            previous.next = target.next;                  
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
}

module.exports = CircularLinkedList;