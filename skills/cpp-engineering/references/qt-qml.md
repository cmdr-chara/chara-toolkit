# Qt/QML object and event-loop boundaries

Read only when the affected C++ uses Qt/QML or Qt workers. Do not introduce Qt conventions into another native framework.

## Establish the actual owner

Inspect QObject parents, creation site, engine exposure, and the application's existing ownership convention before adding deletion or another smart-pointer owner. C++ ownership, QObject parenting, and JavaScript engine ownership can interact; do not give two mechanisms authority to destroy the same object. For objects returned into QML, check the documented ownership heuristic and any explicit override. Retained QML references alone do not justify assuming a C++ object will remain alive.

Trace engine/component shutdown and destruction order. Context properties, registered types, invokable methods, signals, properties, and notify signals form an interface to QML consumers; renaming a C++ method or member can change that interface. Verify a binding's observable update, not just C++ compilation.

## Follow affinity and event delivery

Record the creating thread, current affinity, receiving event loop, connection type, and shutdown owner for each worker object. A QThread object and the thread running its work are distinct. Moving an object is constrained by its parent and children; it does not make direct cross-thread calls safe. GUI access belongs on the framework's permitted GUI thread.

For queued callbacks and captured pointers, account for receiver destruction, pending work, and reentry. Plan quit/join and object disposal together: `deleteLater()` needs the documented event-delivery/shutdown conditions, so adding it after an event loop has stopped is not a general cleanup fix. Avoid blocking waits or blocking queued calls that create a dependency cycle with the caller's event loop.

Media callbacks may run outside the UI thread. Preserve backend buffer lifetime, bounded work and allocation rules, and how results reach QML. Exercise rapid replacement, cancellation, and shutdown when those lifetimes change; a static QML screenshot cannot establish media-thread correctness.

## Keep the build and evidence connected

When QObject macros or exposed headers change, verify that CMake's actual target source list and AUTOMOC processing cover them. Use the existing Qt target/module/resource setup; do not hand-edit generated moc files or introduce a parallel registration system. Preserve the project's selected C++ and Qt requirements.

Run the affected native tests and an available QML/application smoke check for the changed binding or lifecycle. State any missing display, multimedia backend, plugin, or device evidence separately from build success.

## Primary sources

- [Qt: threads, objects, and event loops](https://doc.qt.io/qt-6/threads-qobject.html)
- [Qt: JavaScript engine object ownership](https://doc.qt.io/qt-6/qjsengine.html#ObjectOwnership-enum)
- [CMake: AUTOMOC target behavior](https://cmake.org/cmake/help/latest/prop_tgt/AUTOMOC.html)

Check the project's Qt release documentation before relying on an API's availability or ownership behavior.
