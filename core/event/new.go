package event

// eventBus contains pub/sub
var eventBus Bus

func init() {
	eventBus = New()
}

// Handler returns the global instance of the event bus
func Handler() Bus {
	return eventBus
}

// Type defines the format of event descriptors
type Type string

// Valid event types for publication and subscription
const (
	// TypeAddAccount for when account for user is created
	TypeAddAccount Type = "ACCOUNT_ADD"
	// TypeAddUser for when user is created
	TypeAddUser Type = "USER_ADD"
	// TypeRemoveUser for when user is deleted
	TypeRemoveUser Type = "USER_DELETE"
	// TypeAddDocument for when document created
	TypeAddDocument Type = "DOCUMENT_ADD"
	// TypeSystemLicenseChange for when global admin user updates license
	TypeSystemLicenseChange Type = "LICENSE_CHANGE"
	// TypeAddSpace for when space created
	TypeAddSpace Type = "SPACE_ADD"
	// TypeRemoveSpace for when space removed
	TypeRemoveSpace Type = "SPACE_REMOVE"
)
