/**
 * 事件对象构造器
 * 使用方式 var e = new Events() 
 * e.on('fire1 fire2',fn,context) 
 * e.off('fire1, fire2',fn,context) 
 * e.trigger('fire', arg1, arg2...)
 */
var Events = function (){};

Events.prototype.on = function(events, callback, context){
  var cache, event, list;
  
  if(typeof callback !== 'function') {
    return this;
  }
  
  events = events.split(/\s+/);
  cache = this.__event || (this.__event = {});

  while(event = events.shift()){
    list = cache[event] || (cache[event] = []);
    list.push(callback, context);
  }
  
  return this;
};

Events.prototype.off = function(events, callback, context){
  var cache, event, i, list;
  
  // 如果目标什么没有自定义__event属性，那么说明没绑定过事件
  if(!(cache = this.__event)) return this;
  // 如果没传任何参数，直接删除所有事件
  if(!(events || callback || context)){
    delete this.__event;
    return this;
  }
  //如果events为null那么就删除所有事件。
  events = events ? events.split(/\s+/) : Object.keys(cache);
  
  while(event = events.shift()){
    list = cache[event];
    if(!list) continue;
    
    //如果只传了事件，而后面两个参数同时为null 那么就删除传入事件名对应所有的事件
    if(!(callback || context)){
      delete cache[event];
      continue;
    }
    
    for(i = list.length - 2; i >= 0; i -= 2){
      // 如果传入事件为null 则去寻找相同的上下文，找到则删除
      // 如果上下文为null 则去寻找相同的事件名，找到则删除
      // 总是需要两个条件都不满足，才执行if条件语句
      if(!(callback && list[i] !== callback || context && list[i + 1] !== context)){
        list.splice(i, 2);
      }
    }
  }
  return this;
};

Events.prototype.trigger = function(events){
  var cache, event, list, i, args = [], returned = true;
  
  if(!(cache = this.__event)) return this;
  
  events = events.split(/\s+/);
  
  for(var i = 1; i < arguments.length; i++){
    args[i - 1] = arguments[i];
  }
  
  while(event = events.shift()){
    if(list = cache[event]){
      list = list.slice();
    }else{
      continue;
    }
    for(i = 0; i < list.length; i += 2){
      returned = list[i].apply((list[i + 1] || this), args) && returned;
    }
  }
  
  return this;
};

/**
 * 注入构造器函数
 * @param  {构造器函数} receiver 
 * @return {Events}          
 */
Events.mixTo = function(receiver){
  var proto = Events.prototype;
  if(typeof receiver === 'function'){
    this.extend(receiver.prototype, proto, true);
  }
  return this;
};
/**
 * 拷贝继承
 * @param  {目标对象} target 
 * @param  {拷贝源} data   
 * @param  {深拷贝} strict 
 * @return {新对象}      
 */
Events.extend = function(target, data, strict){
  target = target || {};
  for(var key in data){
    if(data.hasOwnProperty(key)){
      if(strict && typeof data[key] === 'object'){
        target[key] = Array.isArray(data[key]) ? [] : {};
        arguments.callee(target[key], data[key], true);
      }else{
        target[key] = data[key];
      }
    }
  }
  return target;
};


