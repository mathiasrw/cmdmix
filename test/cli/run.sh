#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source $DIR/aserta.sh

# # Command exit codes
# assert_success    "true"
# assert_failure    "false"
# assert_raises     "unknown_cmd" 127
# 
# Expected output
# assert            "echo test"    "test"
# assert            "seq 3"        "1\n2\n3"
# assert_contains   "echo foobar"  "oba"
# assert_startswith "echo foobar"  "foo"
# assert_endswith   "echo foobar"  "bar"
# assert_matches    "echo foobar"  "^f.*r$"
# 
# assert_end "example"

reset() {
		echo 'Resetting testdata'
        echo 'foobar' > my.file
}



# Plain usage
reset
cmdmix 'echo {1}' a > my.file
assert		 		"cat my.file"    "a"

cmdmix 'echo {1}' a b c > my.file
assert		 		"cat my.file"    "a b c"

cmdmix 'echo {2} {1}' a b c > my.file
assert		 		"cat my.file"    "b c a"

cmdmix 'echo {1} {2} {3}' a b c > my.file
assert		 		"cat my.file"    "a b c"

cmdmix 'echo {1} {2} {10}' a b c > my.file
assert		 		"cat my.file"    "a b c"

cmdmix 'echo {2} {10} {1}' a b c > my.file
assert		 		"cat my.file"    "b c a"


# The zero key
cmdmix 'echo {0}' ab c > my.file
assert		 		"cat my.file"    "ab c"

cmdmix 'echo' ab c > my.file
assert		 		"cat my.file"    "ab c"

cmdmix 'echo' "a b" c > my.file
assert		 		"cat my.file"    "a b c"




# prefix = 'Escape';
# test('echo {1} a b c', 'echo {{1}} {2}', 'a b c');
# test('echo {{1}} a b c', 'echo {{{1}}} {2}', 'a b c');

# prefix = 'Explicit';
# test('echo {1} b', 'echo {{1}} {2}', 'a b c', {explicit: 1});
# test('echo a b c{1} b', 'echo {0}{{1}} {2}', 'a b c', {explicit: 1});

# prefix = 'Cases';
# test('echo a b c 123', 'echo {1} 123', 'a b c');




rm my.file

assert_end 			"cmdmix"










