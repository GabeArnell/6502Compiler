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
    ['Multiline Strings >:(']: `{\nstring a = "this should\nbe failing right?"\nb="yes"}$`
};
//# sourceMappingURL=TestCases.js.map