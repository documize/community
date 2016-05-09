package request

import (
	"database/sql"
	"github.com/documize/community/documize/api/entity"
	"testing"
)

func testAddUser(t *testing.T, p *Persister) entity.User {
	user := entity.User{
		BaseEntity: entity.BaseEntity{RefID: p.Context.UserID},
		Firstname:  "testFirstname",            // string    `json:"firstname"`
		Lastname:   "testLastname",             // string    `json:"lastname"`
		Email:      "testuser@somecompany.zit", // string    `json:"email"`
		Active:     true,                       // bool      `json:"active"`
		Editor:     true,                       // bool      `json:"editor"`
		Admin:      true,                       // bool      `json:"admin"`
		//Password:   "testpassword",             // string    `json:"-"`
		//Salt:       "testsalt",                 // string    `json:"-"`
		//Reset:      "testreset",                // string    `json:"-"`
		Accounts: nil, // []Account `json:"accounts"`
	}
	user.Salt = generateSalt()
	requestedPassword := generateRandomPassword()
	user.Password = generatePassword(requestedPassword, user.Salt)

	err := p.AddUser(user)
	if err != nil {
		t.Error(err)
		p.testRollback(t)
		testDeleteUser(t, p)
		t.Fail()
	}
	p.testCommit(t)
	return user
}

func testDeleteUser(t *testing.T, p *Persister) {
	p.testNewTx(t) // so that we can use it reliably in defer
	rows, err := p.Base.Delete(p.Context.Transaction, "user", p.Context.UserID)
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	if rows != 1 {
		t.Errorf("expected 1 row deleted got %d", rows)
		t.Fail()
	}
	p.testCommit(t)
}

func TestUser(t *testing.T) {
	p := newTestPersister(t)
	defer deleteTestAuditTrail(t, p)
	org := testAddOrganization(t, p)
	defer testDeleteOrganization(t, p)
	user := testAddUser(t, p)
	defer testDeleteUser(t, p)
	/*acc :=*/ testAddAccount(t, p)
	//defer testDeleteAccount(t, p) // done by p.DeactiveUser()

	//t.Log(user)

	err := p.AddUser(user)
	if err == nil {
		t.Error("should have errored on duplicate user", err)
	}
	p.testRollback(t)

	usr1, err := p.GetUser(p.Context.UserID)
	if err != nil {
		t.Error(err)
	}
	if usr1.Firstname != user.Firstname {
		t.Error("wrong data returned")
	}
	p.testRollback(t)

	_, err = p.GetUser("XXXXXXXXXXXXX")
	if err == nil {
		t.Error("should have errored on get unknown user", err)
	}
	p.testRollback(t)

	usr2, err := p.GetUserByEmail(user.Email)
	if err != nil {
		t.Error(err)
	}
	if usr2.Firstname != user.Firstname {
		t.Error("wrong data returned")
	}
	p.testRollback(t)

	_, err = p.GetUserByEmail("XXXXXXXXXXXXX")
	if err != sql.ErrNoRows {
		t.Error("should have errored with sql.ErrNoRows on get user by unknown email", err)
	}
	p.testRollback(t)

	usr3, err := p.GetUserByDomain(org.Domain, user.Email)
	if err != nil {
		t.Error(err)
	}
	if usr3.Firstname != user.Firstname {
		t.Error("wrong data returned")
	}
	p.testRollback(t)

	_, err = p.GetUserByDomain("XXXXXXXXXXXXX", "YYYYYYYYYYYYY")
	if err != sql.ErrNoRows {
		t.Error("should have errored with sql.ErrNoRows on get user by unknown email", err)
	}
	p.testRollback(t)

	usr4, err := p.GetUserBySerial(usr3.Salt)
	if err != nil {
		t.Error(err)
	}
	if usr4.Firstname != usr3.Firstname {
		t.Error("wrong data returned", user, usr4)
	}
	p.testRollback(t)

	_, err = p.GetUserBySerial("XXXXXXXXXXXXX")
	if err != sql.ErrNoRows {
		t.Error("should have errored with sql.ErrNoRows on get user by unknown serial", err)
	}
	p.testRollback(t)

	uu := user
	uu.Lastname = "Smith"
	err = p.UpdateUser(uu)
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)

	users, err := p.GetUsersForOrganization()
	if err != nil {
		t.Error(err)
	}
	if len(users) != 1 {
		t.Error("wrong number of users returned", len(users))
	} else {
		if users[0].Lastname != "Smith" {
			t.Error("wrong data returned", users[0], user)
		}
	}
	p.testRollback(t)

	err = p.UpdateUserPassword(user.RefID, "salt", "password")
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)

	err = p.UpdateUserPassword("XXXXXXXXXX", "salt", "password")
	if err == nil {
		t.Error("did not error when expected")
	}
	p.testRollback(t)

	err = p.ForgotUserPassword("XXXXXXXXXXX", "token")
	if err != sql.ErrNoRows {
		t.Error("should have errored with sql.ErrNoRows ForgotUserPassword with unknown ID", err)
	}
	p.testRollback(t)

	err = p.ForgotUserPassword(user.Email, "token")
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)

	usrT, err := p.GetUserByToken("token")
	if err != nil {
		t.Error(err)
	}
	if usrT.Lastname != "Smith" {
		t.Error("wrong data returned", usrT)
	}
	p.testRollback(t)

	_, err = p.GetUserByToken("XXXXXXXXXX")
	if err == nil {
		t.Error("did not error when expected")
	}
	p.testRollback(t)

	err = p.DeactiveUser(user.RefID) // does not error on bad ID
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)

	_, err = p.GetUserByDomain(org.Domain, user.Email)
	if err == nil {
		t.Error("did not error when expected")
	}
	p.testRollback(t)

}
