import AssignNode from "./program_back/AST/AssignNode.js";
import DeclareVariable from "./program_back/AST/DeclareVariable.js";
import NumNode from "./program_back/AST/NumNode.js";
import Storage from "./program_back/Storage.js";


const storage = new Storage();

// 1. Создаем переменную
const declareC = new DeclareVariable('c');
declareC.execute(storage);

console.log(storage.varibles);

// 2. Присваиваем c = 100
const assign1 = new AssignNode('c', new NumNode(100));
assign1.execute(storage);
