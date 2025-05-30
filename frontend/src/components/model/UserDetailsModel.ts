export type UserDetails = {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string | null;
    bio: string | null;
    blog: string;
    company: string | null;
    created_at: string;
    email: string | null;
    events_url: string;
    followers: number;
    followers_url: string;
    following: number;
    following_url: string;
    gists_url: string;
    hireable: boolean | null;
    html_url: string;
    location: string | null;
    name: string;
    notification_email: string | null;
    organizations_url: string;
    public_gists: number;
    public_repos: number;
    received_events_url: string;
    repos_url: string;
    site_admin: boolean;
    starred_url: string;
    subscriptions_url: string;
    twitter_username: string | null;
    type: string;
    updated_at: string;
    url: string;
    user_view_type: string;
};

export const DefaultUserDetails: UserDetails = {
    login: "Loading...",
    id: 0,
    node_id: "Loading...",
    avatar_url: "https://via.placeholder.com/150",
    gravatar_id: null,
    bio: null,
    blog: "",
    company: null,
    created_at: "Loading...",
    email: null,
    events_url: "#",
    followers: 0,
    followers_url: "#",
    following: 0,
    following_url: "#",
    gists_url: "#",
    hireable: null,
    html_url: "#",
    location: "Loading...",
    name: "Loading...",
    notification_email: null,
    organizations_url: "#",
    public_gists: 0,
    public_repos: 0,
    received_events_url: "#",
    repos_url: "#",
    site_admin: false,
    starred_url: "#",
    subscriptions_url: "#",
    twitter_username: null,
    type: "Loading...",
    updated_at: "Loading...",
    url: "#",
    user_view_type: "Loading..."
};
