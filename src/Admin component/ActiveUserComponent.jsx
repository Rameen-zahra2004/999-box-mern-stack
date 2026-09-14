import { useSelector } from "react-redux";

export default function ActiveUsers() {
  const activeUsers = useSelector((state) => state.activeUsers.list) || [];

  return (
    <div className="p-4 bg-gray-50 rounded-2xl shadow-md min-h-[300px]">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
        🟢 Active Users
      </h1>

      {activeUsers.length === 0 ? (
        <p className="text-gray-500 text-center mt-6">
          No active users right now.
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <ul className="space-y-2">
            {activeUsers.map((user) => (
              <li
                key={user.id}
                className="flex justify-between items-center p-3 border rounded-lg bg-white hover:shadow-md transition duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                    {(user.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-700">
                    {user.name || "Unknown user"}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    user.isLoggedIn
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {user.isLoggedIn ? "Logged In" : "Visitor"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
