project(rp)

include_directories(c)
add_definitions(/wd4996)
add_executable(rp main.c)
target_link_libraries(rp "${CMAKE_CURRENT_SOURCE_DIR}/lib/x86_64/discord_game_sdk.dll.lib")
