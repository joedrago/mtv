#include "discord_game_sdk.h"
#include <assert.h>
#include <stdint.h>
#include <stdio.h>
#ifdef _WIN32
#include <Windows.h>
#else
#include <string.h>
#include <unistd.h>
#endif

// defines SUPER_SECRET_CLIENT_ID and SUPER_SECRET_ACTIVITY_SECRET
#include "super_secret.h"

#define DISCORD_REQUIRE(x) assert(x == DiscordResult_Ok)

struct Application
{
    struct IDiscordCore * core;
    struct IDiscordUserManager * users;
    struct IDiscordAchievementManager * achievements;
    struct IDiscordActivityManager * activities;
    struct IDiscordRelationshipManager * relationships;
    struct IDiscordApplicationManager * application;
    struct IDiscordLobbyManager * lobbies;
    DiscordUserId user_id;
    char lastTitle[2048];
};

void UpdateActivityCallback(void * data, enum EDiscordResult result)
{
    DISCORD_REQUIRE(result);
}

bool RelationshipPassFilter(void * data, struct DiscordRelationship * relationship)
{
    return (relationship->type == DiscordRelationshipType_Friend);
}

bool RelationshipSnowflakeFilter(void * data, struct DiscordRelationship * relationship)
{
    struct Application * app = (struct Application *)data;

    return (relationship->type == DiscordRelationshipType_Friend && relationship->user.id < app->user_id);
}

void OnRelationshipsRefresh(void * data)
{
}

void OnUserUpdated(void * data)
{
    struct Application * app = (struct Application *)data;
    struct DiscordUser user;
    app->users->get_current_user(app->users, &user);
    app->user_id = user.id;
}

void OnOAuth2Token(void * data, enum EDiscordResult result, struct DiscordOAuth2Token * token)
{
    if (result == DiscordResult_Ok) {
        printf("OAuth2 token: %s\n", token->access_token);
    } else {
        printf("GetOAuth2Token failed with %d\n", (int)result);
    }
}

void OnLobbyConnect(void * data, enum EDiscordResult result, struct DiscordLobby * lobby)
{
    printf("LobbyConnect returned %d\n", (int)result);
}

BOOL CALLBACK findMTVWindowTitle(_In_ HWND hwnd, _In_ LPARAM lParam)
{
    char * title = (char *)lParam;

    char temp[128];
    GetWindowText(hwnd, temp, 128);
    temp[127] = 0;

    char * mtvStringStart = strstr(temp, " - [[MTV]]");
    if (mtvStringStart) {
        *mtvStringStart = 0;
        strcpy(title, temp);
        return FALSE;
    }
    return TRUE;
}

void UpdatePresence(struct Application * app)
{
    char title[128];
    title[0] = 0;
    EnumWindows(findMTVWindowTitle, (LPARAM)title);

    if (*title && (strcmp(app->lastTitle, title) != 0)) {
        printf("New title: %s\n", title);
        strcpy(app->lastTitle, title);

        struct DiscordActivity activity;
        memset(&activity, 0, sizeof(activity));
        sprintf(activity.assets.large_image, "mtv");
        sprintf(activity.assets.large_text, "MTV");
        strcpy(activity.state, title);
        sprintf(activity.details, "Watching MTV");

        app->activities->update_activity(app->activities, &activity, app, UpdateActivityCallback);
    }
}

int main(int argc, char ** argv)
{
    struct Application app;
    memset(&app, 0, sizeof(app));

    struct IDiscordUserEvents users_events;
    memset(&users_events, 0, sizeof(users_events));
    users_events.on_current_user_update = OnUserUpdated;

    struct IDiscordActivityEvents activities_events;
    memset(&activities_events, 0, sizeof(activities_events));

    struct IDiscordRelationshipEvents relationships_events;
    memset(&relationships_events, 0, sizeof(relationships_events));
    relationships_events.on_refresh = OnRelationshipsRefresh;

    struct DiscordCreateParams params;
    DiscordCreateParamsSetDefault(&params);
    params.client_id = SUPER_SECRET_CLIENT_ID;
    params.flags = DiscordCreateFlags_Default;
    params.event_data = &app;
    params.activity_events = &activities_events;
    params.relationship_events = &relationships_events;
    params.user_events = &users_events;
    DISCORD_REQUIRE(DiscordCreate(DISCORD_VERSION, &params, &app.core));

    app.users = app.core->get_user_manager(app.core);
    app.achievements = app.core->get_achievement_manager(app.core);
    app.activities = app.core->get_activity_manager(app.core);
    app.application = app.core->get_application_manager(app.core);
    app.lobbies = app.core->get_lobby_manager(app.core);

    app.lobbies->connect_lobby_with_activity_secret(app.lobbies, SUPER_SECRET_ACTIVITY_SECRET, &app, OnLobbyConnect);

    app.application->get_oauth2_token(app.application, &app, OnOAuth2Token);

    DiscordBranch branch;
    app.application->get_current_branch(app.application, &branch);
    printf("Current branch %s\n", branch);

    app.relationships = app.core->get_relationship_manager(app.core);

    DWORD lastCheck = GetTickCount();
    for (;;) {
        DISCORD_REQUIRE(app.core->run_callbacks(app.core));

        DWORD now = GetTickCount();
        if (now > (lastCheck + 5000)) {
            lastCheck = now;

            UpdatePresence(&app);
        }

#ifdef _WIN32
        Sleep(16);
#else
        usleep(16 * 1000);
#endif
    }

    return 0;
}
