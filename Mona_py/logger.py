import time

ansi_codes = {
    "warning": "\33[41;30m",    # Red background, black text
    "start": "\33[105;30m",     # Magenta background, black text
    "command": "\33[44;30m",    # Blue background, black text
    "info": "\33[42;30m",       # Green background, black text
    "error": "\33[101;30m",     # Red background, black text
    "reset": "\33[0m"           # Reset all colors
}


def log(type, message, *args):
    current_time = time.gmtime()
    print(f"{ansi_codes[type]}[{time.strftime('%H:%M:%S', current_time)}]{ansi_codes['reset']} {message}", *args)