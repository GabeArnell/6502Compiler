const TEST_CASES = {
    ['Project 1 Testcases']: `{}$\n` + `{{{{{{}}}}}}$\n{{{{{{}}} /* comments are ignored */ }}}}$\n{ /* comments are still ignored */ int @}$\n{\n  int a\n  a = a\n  string b\n  a=b\n}$`,
    [`Lex with spaced`]: `/*Long Test Case - Everything Except Boolean Declaration */
{
/* Int Declaration */
int a
int b
a = 0
b=0
/* While Loop */
while (a != 3) {
print(a)
while (b != 3) {
print(b)
b = 1 + b
if (b == 2) {
/* Print Statement */
print("there is no spoon" /* This will do nothing */ )
}
}
b = 0
a = 1+a
}
}
$
`,
    ['Lex w/o spaces']: `/*LongTestCase-EverythingExceptBooleanDeclaration*/{/*IntDeclaration*/intaintba=0b=0/*WhileLoop*/while(a!=3){print(a)while(b!=3){print(b)b=1+bif(b==2){/*PrintStatement*/print("there is no spoon"/*Thiswilldonothing*/)}}b=0a=1+a}}$`,
    ['Tabs r Bad']: `{\n\tstring b = "this should not be even considered to be accurate"\t\n}$`,
    ['Multiline Strings >:(']: `{\nstring a = "this should\nbe failing right?"\nb="yes"}$`,
    ['Every Token Test']: '{/* Comment!!!*/ ()\nprint=whileif"teststring"\nintstringbooleanfalse\ntrue\n==!=+ a 0123456789}$',
    ['Unpaired Comments']: `{/*/*This is */ "a test" *//*}$`,
    ['Lets check your program splitter']: `{}$/*$$$ This should be ignored */$$$"the$tringstillsplits"`,
    ['Parse-o-rama']: `
{/*this caused my compiler to go into an infinite loop*/
    {}
    {int astringb}
    {
    print(a)print(2)print(0+1)print(false)print(true)print("test")print((a==b))print((a!="tes t"))
    a = aa=bb=bb=1b=1+bb="te st"b=""b=falseb=true
    while true{
    if (5+a=="test"){
    
    }
    }
    
    }
    }$
`,
    ['Project 2 Tests']: `{}$
{{{{{{}}}}}}$
{{{{{{}}}/*comments	are	ignored	*/}}}}$
{ /* comments are still ignored*/int@}$
`,
    ["MoveUp Verification"]: `
{
    while true {
        if (a == 2+b){
            a = b
        }
    }


}$

`,
    ["AST Trio"]: `{
int a
a = 1
print(a)
}$`,
    ['AST Conditionals']: `
{
int a
a = 1
if (2+a == 2){
    a = 1
}
while false {

}
}$    
`,
    ['Symbol Scopes']: `/**This should break on a but allow b to go through**/
{
int b
int a
{
    string b
}
string a
}$`,
    ['Self Initialization']: `
{
/*This should give a warning as the initialization is using the uninitialized value*/
int a
a = 2+a
boolean b
b = (false == b)


}$
`,
    'Comparison Type Checking': `
{
if ((2+2==4)!=("hi"=="hello")){
    print("correct")
}
}$

`,
    ['CodeGenHairPuller']: `
/* this is not working for some reason
 need to go through step by step 
 the values print correctly so its an issue with the comparison
 */
{
int a
a = 9
int b
b = 4
if (a ==2+3+b){
print("yes")
}
print(b)
print(2+3)
print(2+3+b)
print(a)
}$
`,
    ['CG: Basic Output of Literals']: `
/*  basic output of all data type literals: output: true false 0 7 hello   world   end    */
{
print(true)
print(false)
print(0)
print(7)
print("hello")
print(" ")
print("world")
print("")
print("end")
}$
`,
    ['CG: complex expressions with literals pt 1']: `
/*   Testing complex expressions with literals pt.1 */
{
    /* output: true 3 6*/
print((2 == 2))
print(1+2)
print(0+1+2+3)
}$
`,
    ['CG complex expressions pt. 2']: `
/*CG complex expressions pt. 2*/
{
    /* output: false true false*/
    print((2 == 1))
    print((3 != 2))
    print ((0 != 0))
}$
`,
    ['CG: Complex expressions pt.3 ']: `
/*Complex expressions pt.3*./
{
    /*output true false)*/
    print ((true == true))
    print ((false != false))
}$
`,
    ['CG: complex expressions pt. 4 ']: `
/*Complex expressions pt.4*./
/* true true*/
{
    print(("true" == "true"))
    print(("true" != "false"))
}$

`,
    ['CG: variable declaration with default values and basic output of values']: `
/*  variable declaration with default values and output  */
{
int a
boolean b
string c
/*output: 0 false [empty string] */ 
print(a)
print(b)
print(c)
}$
`,
    ['CG: Basic variable assignment']: `
/*  Basic variable assignment  */
{
int a
boolean b
string c

a = 9
b = true
c = "hello world"
/*output: 9 true hello world*/
print(a)
print(b)
print(c)
}$
`,
    ['CG: Complex variable assignment with literals']: `
/*  Complex variable assignment with literals  */
{
int a
boolean b

a = 2+3+4
b = (2 == 2)
/*output: 9 true)*/
print(a)
print(b)
}$
`,
    ['CG: Variables assigned with variables']: `
/*  Variables assigned with variables  */
{
int a
a = 1
int b
b = 3
a = 2+3+a
/*output: 6*/
print(a)
b = 3+a
/*output: 9 */
print(b)
}$
`,
    ['CG: Variable comparisons (also in complex experessions) pt 1']: `
/*  Variable comparisons (also in complex expressions)  pt 1*/
{
int a 
a = 2
/*output: 7 true false */
print(2+3+a)
print((2+a == 3+1))
print((1+a == 2+a))
}$
`,
    ['CG: Variable comparisons (also in complex experessions) pt 2']: `
/*  Variable comparisons (also in complex expressions)  pt 2*/
{
boolean b 
/*output: true true false */
print((false == b))
print((true != b))
print((false != b))
}$
`,
    ['CG: Variable comparisons (also in complex experessions) pt 3']: `
/*  Variable comparisons (also in complex expressions)  pt 3*/
{
boolean b 
/*output:  false true*/
print((true == b))
print(((b == false) == true))
}$
`,
    ['CG: Variable declaration/assignment in scope']: `
/*  Variable declaration/assignment in scope output: 4 3 2 1 */
{
int a
a=1
int b 
b=2
{   
    int a
    a = 2
    b = 4
    {
        int a 
        a = 3
        print(b)
        print(a)
    }
    print(a)
}
print(a)

}$

`,
    ['CG: Boolean If Statements']: `
/*  Boolean If Statements output: if statement worked*/
{
if true {
    print("if statement worked")
}
if false{
    print("if statement failed")
}
}$
`,
    ['CG: Boolean expression if statements and nesting if statements pt.1']: `
/*  Boolean expression if statements and nesting if statements pt.1. output: success*/
{
int a 
a=5
if (a == 5) {
    if (a == 1+4){
        if (2+a==4+3){
            print("success")
        }
    }
}
}$
`,
    ['CG: Boolean expression if statements and nesting if statements pt.2']: `
/*  Boolean expression if statements and nesting if statements pt.2. output: success two*/
{
boolean b 
string c
c="test"
if (b == false){
    if (c == "test"){
        if (c != "nottest"){
            print("success two")
        }
    }       
}
}$
`,
    ['CG: While Statements']: `
/*  While Statements output: 1 2 3 4 5 6 7 8 9*/
{
int x
while (x != 9){
    x = 1+x
    print(x)
}
}$

`,
    ['CG: While True']: `
/*  While True output: 1 2 3 4 5 6 7 8 9 [does not stop increasing] */
{
int x
while true {
    x = 1+x
    print(x)
}
print("ended")
}$

`,
    ['CG: While false and boolean expresion']: `
/*  While false and boolean expresion output: ended*/
{
int x
while (true == false) {
    x = 1+x
    print(x)
}
print("ended")
}$

`,
    ['CG: nested while loops']: `
/*  nested while loops: (should count from 1 to 81) */
{
int i
int c
c = 0
while (i != 9) {
    int j
    while (j != 9){
        c = 1+c 
        print(c)
        j=1+j
    }
    i=1+i
}
print("ended")
}$

`,
    ['CG: Boolean hell']: `
/*  Boolean hell*/
{
if ((true != true) == (false == (false == (true != true)))){
    print("made it")
}
}$
`,
    ['CG: Heap overflow']: `/*  Heap overflow: This should fail code generation */
{
    int a 
    a = 2
    print("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum")
    if (a == 2){
        print("hi")
    }
    }$    
`,
    ['CG: Stack overflow ']: `
/*  Stack overflow: This should fail code generation */
{
int a
int b 
int d
int e 
int f 
int g 
int h 
int i 
int j 
int k
int l
int m 
int n 
int o 
int p 
int q 
int r
int s
int t
int u
int v
int w
int x
int y
int z
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
a=2
}$
`,
    ['Post-Class Tnull variable']: `
{
    int a
    a = 0
    string q
    {
       a = 2
       int a
       {
          string c
          {
             a = 4
             c = "hello"
          }
          print(c)
       }
       print(a)
       q = "world"
    }
    print(a)
    print(q)
 }$

`,
    ['Post-Class Crash 1']: `
 {
       int a
       a = 3
       int b
       b = 4
       a = b
       print(a)
       if (a == b) {
          print(a)
       }
     }$
`,
    ['Post-Class Crash 2']: `
 {
        int a
        boolean b
        string c
       a = 9
        b = true
        {
           print(a)
           print(b)
           b = false
           c = "hello world"
           int b
           b = 0
           {
              print(c)
              a = 1 + 2 + a
              {
                 print(b)
              }
           }
           b = a
           print(b)
        }
        print(b)
    



}$
`
};
//# sourceMappingURL=TestCases.js.map