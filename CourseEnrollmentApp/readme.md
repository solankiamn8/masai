var rotateRight = function(head, k) {
  if(!head || !head.next || k===0) return head
  
  let length = 1
  let tail = head
  while(tail.next){
    tail = tail.next
    length++
  }
  
  k = k % length
  if(k===0) return head
  
  let curr = head
  for(let i=1; i<k; i++){
    curr = curr.next
  }
  
  let newHead = curr.next
  curr.next = null
  tail.next = head
  
  return newHead
  
  
};