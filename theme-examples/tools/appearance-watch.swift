// appearance-watch <state-file>
//
// Keeps <state-file> holding "dark" or "light", rewriting it the moment macOS announces an appearance change, and
// prints the same word on its standard output. Event-driven (the system's own "theme changed" notification), so
// nothing polls. Only one instance does the work: it holds <state-file>.lock; a second one prints "busy" and exits
// at once. Exits when its parent is gone, so it never outlives the session that started it.
import Foundation

setvbuf(stdout, nil, _IOLBF, 0)

guard CommandLine.arguments.count == 2 else {
    FileHandle.standardError.write("usage: appearance-watch <state-file>\n".data(using: .utf8)!)
    exit(2)
}

let statePath = CommandLine.arguments[1]
let stateURL = URL(fileURLWithPath: statePath)
try? FileManager.default.createDirectory(at: stateURL.deletingLastPathComponent(), withIntermediateDirectories: true)

let lockFd = open(statePath + ".lock", O_CREAT | O_RDWR, 0o600)
if lockFd < 0 || flock(lockFd, LOCK_EX | LOCK_NB) != 0 {
    print("busy")
    exit(0)
}

typealias GetTheme = @convention(c) () -> Int32
let skyLight = dlopen("/System/Library/PrivateFrameworks/SkyLight.framework/SkyLight", RTLD_LAZY)
let slsGet: GetTheme? = skyLight.flatMap { dlsym($0, "SLSGetAppearanceThemeLegacy") }.map { unsafeBitCast($0, to: GetTheme.self) }

func kind() -> String {
    if let get = slsGet { return get() == 1 ? "dark" : "light" }
    CFPreferencesAppSynchronize(kCFPreferencesAnyApplication)
    let value = CFPreferencesCopyValue("AppleInterfaceStyle" as CFString, kCFPreferencesAnyApplication, kCFPreferencesCurrentUser, kCFPreferencesAnyHost) as? String
    return value == "Dark" ? "dark" : "light"
}

func publish(_ word: String) {
    // A new file each time, moved into place: readers never see half of it, and its stamp always moves.
    let temp = stateURL.deletingLastPathComponent().appendingPathComponent(".appearance-\(getpid()).tmp")
    try? (word + "\n").data(using: .utf8)!.write(to: temp)
    _ = rename(temp.path, statePath)
    print(word)
}

var last = kind()
publish(last)

func check() {
    let now = kind()
    if now != last {
        last = now
        publish(now)
    }
}

DistributedNotificationCenter.default().addObserver(
    forName: Notification.Name("AppleInterfaceThemeChangedNotification"), object: nil, queue: .main
) { _ in
    // The value can land a moment after the notification: look now and a few times after.
    check()
    for delay in [0.03, 0.1, 0.3, 1.0] {
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) { check() }
    }
}

// A belt: a missed notification is caught within two seconds, and an orphan goes away.
Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { _ in
    if getppid() == 1 { exit(0) }
    check()
}

RunLoop.main.run()
