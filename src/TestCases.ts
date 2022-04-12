const TEST_CASES = {
['Project 1 Testcases']:
`{}$\n`+`{{{{{{}}}}}}$\n{{{{{{}}} /* comments are ignored */ }}}}$\n{ /* comments are still ignored */ int @}$\n{\n  int a\n  a = a\n  string b\n  a=b\n}$`,

[`Lex with spaced`]: 
`/*Long Test Case - Everything Except Boolean Declaration */
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

['Tabs r Bad']:`{\n\tstring b = "this should not be even considered to be accurate"\t\n}$`
,
['Multiline Strings >:(']: `{\nstring a = "this should\nbe failing right?"\nb="yes"}$`
,
['Every Token Test']: '{/* Comment!!!*/ ()\nprint=whileif"teststring"\nintstringbooleanfalse\ntrue\n==!=+ a 0123456789}$',

['Unpaired Comments']: `{/*/*This is */ "a test" *//*}$`,

['Lets check your program splitter']: `{}$/*$$$ This should be ignored */$$$"the$tringstillsplits"`,

['Parse-o-rama']:
`
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
['Project 2 Tests']: 
`{}$
{{{{{{}}}}}}$
{{{{{{}}}/*comments	are	ignored	*/}}}}$
{ /* comments are still ignored*/int@}$
`,
["MoveUp Verification"]:
`
{
    while true {
        if (a == 2+b){
            a = b
        }
    }


}$

`,
["AST Trio"]: 
`{
int a
a = 1
print(a)
}$`,
['AST Conditionals']: 
`
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
['Symbol Scopes']: 
`/**This should break on a but allow b to go through**/
{
int b
int a
{
    string b
}
string a
}$`,
['Self Initialization']: 
`
{
/*This should give a warning as the initialization is using the uninitialized value*/
int a
a = 2+a
boolean b
b = (false == b)


}$
`,
'Comparison Type Checking':
`
{
if ((2+2==4)!=("hi"=="hello")){
    print("correct")
}
}$

`

}