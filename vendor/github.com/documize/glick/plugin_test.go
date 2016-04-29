package glick_test

import (
	"errors"
	"reflect"
	"testing"
	"time"

	"github.com/documize/glick"

	"golang.org/x/net/context"
)

func TestAPI(t *testing.T) {
	l, nerr := glick.New(nil)
	if nerr != nil {
		t.Error(nerr)
	}
	if err := l.RegAPI("z", nil, nil, time.Second); err != glick.ErrNilAPI {
		t.Error("does not return nil api error")
	}
	var dummy int
	outGood := func() interface{} { var d int; return interface{}(&d) }
	if err := l.RegAPI("z", dummy, outGood, time.Second); err != nil {
		t.Error("1st reg API returns error")
	}
	if err := l.RegAPI("z", dummy, outGood, time.Second); err == nil {
		t.Error("does not return duplicate api error")
	}
	if _, err := l.Run(nil, "z", "unknown", dummy); err == nil {
		t.Error("does not return no plugin")
	}
	if _, err := l.Run(nil, "unknown", "unknown", dummy); err == nil {
		t.Error("does not return unknown api error")
	}
}

func Simp(ctx context.Context, in interface{}) (out interface{}, err error) {
	r := in.(int)
	return &r, nil
}
func outSimp() interface{} { var i int; return interface{}(&i) }

func TestSimple(t *testing.T) {
	l, nerr := glick.New(nil)
	if nerr != nil {
		t.Error(nerr)
	}
	api := "S"
	var i int
	if err := l.RegPlugin("unknown", "Test", Simp, nil); err == nil {
		t.Error("register plugin does not give unknown API error")
	}
	if err := l.RegAPI(api, i, outSimp, time.Second); err != nil {
		t.Error(err)
		return
	}
	if er1 := l.RegPlugin(api, "Test", Simp, nil); er1 != nil {
		t.Error("register gives error", er1)
	}
	if ret, err := l.Run(nil, api, "Test", 42); err != nil {
		t.Error(err)
	} else {
		if *ret.(*int) != 42 {
			t.Error("called plugin did not work")
		}
	}

	if ppo, err := l.ProtoPlugOut(api); err == nil {
		if reflect.TypeOf(ppo()) != reflect.TypeOf(outSimp()) {
			t.Error("wrong proto type")
		}
	} else {
		t.Error(err)
	}
	if _, err := l.ProtoPlugOut("Sinbad"); err == nil {
		t.Error("no error for non-existant api")
	}
}

func TestDup(t *testing.T) {
	l, nerr := glick.New(nil)
	if nerr != nil {
		t.Error(nerr)
	}
	var d struct{}
	if er0 := l.RegAPI("A", d,
		func() interface{} { var s struct{}; return interface{}(&s) },
		time.Second); er0 != nil {
		t.Error("register API gives error")
	}
	if er1 := l.RegPlugin("A", "B", Simp, nil); er1 != nil {
		t.Error("first entry gives error")
	}
	er2 := l.RegPlugin("A", "B", Simp, nil)
	if er2 != nil {
		t.Error("second entry should not give error")
	}
}

func Tov(ctx context.Context, in interface{}) (interface{}, error) {
	t := true
	return &t, nil
}

func outTov() interface{} {
	var t bool
	return interface{}(&t)
}

func Def(ctx context.Context, in interface{}) (interface{}, error) {
	t := false
	return &t, nil
}

func outDef() interface{} {
	var t bool
	return interface{}(&t)
}

func Forever(ctx context.Context, in interface{}) (interface{}, error) {
	time.Sleep(time.Hour)
	return nil, nil // this line is unreachable in practice
}
func outForever() interface{} {
	var t bool
	return interface{}(&t)
}

func JustBad(ctx context.Context, in interface{}) (interface{}, error) {
	return nil, errors.New("just bad, bad, bad")
}

func outJustBad() interface{} {
	var t bool
	return interface{}(&t)
}

func TestOverloaderMOL(t *testing.T) {
	hadOvStub := Tov
	l, nerr := glick.New(func(ctx context.Context, api, act string, handler glick.Plugin) (context.Context, glick.Plugin, error) {
		if api == "abc" && act == "meaning-of-life" {
			return ctx, hadOvStub, nil
		}
		return ctx, nil, nil
	})
	if nerr != nil {
		t.Error(nerr)
	}
	var prototype int
	if err := l.RegAPI("abc", prototype,
		func() interface{} { var b bool; return interface{}(&b) },
		time.Second); err != nil {
		t.Error(err)
		return
	}
	if err := l.RegPlugin("abc", "default", Def, nil); err != nil {
		t.Error(err)
		return
	}
	if ret, err := l.Run(nil, "abc", "default", 1); err != nil {
		t.Error(err)
	} else {
		if *ret.(*bool) {
			t.Error("Overloaded function called in error")
		}
	}
	if ret, err := l.Run(nil, "abc", "meaning-of-life", 1); err != nil {
		t.Error(err)
	} else {
		if !*ret.(*bool) {
			t.Error("Overloaded function not called")
		}
	}
}

func TestOverloaderBad(t *testing.T) {
	l, nerr := glick.New(func(ctx context.Context, api, act string, handler glick.Plugin) (context.Context, glick.Plugin, error) {
		if api == "abc" && act == "bad" {
			return ctx, nil, errors.New("you done a bad... bad... thing")
		}
		return ctx, nil, nil
	})
	if nerr != nil {
		t.Error(nerr)
	}
	var prototype int
	if err := l.RegAPI("abc", prototype,
		func() interface{} { var b bool; return interface{}(&b) },
		time.Second); err != nil {
		t.Error(err)
		return
	}
	if err := l.RegPlugin("abc", "bad", Def, nil); err != nil {
		t.Error(err)
		return
	}
	if _, err := l.Run(nil, "abc", "bad", 1); err == nil {
		t.Error("overloader should have errored")
		return
	}
	ctx, can := context.WithTimeout(context.Background(), time.Millisecond)
	defer can()
	if err := l.RegPlugin("abc", "justBad", JustBad, nil); err != nil {
		t.Error(err)
		return
	}
	ctx, can = context.WithTimeout(context.Background(), time.Millisecond)
	defer can()
	if _, err := l.Run(ctx, "abc", "justBad", 1); err == nil {
		t.Error("overloader should have errored")
		return
	}

}

func TestOverloaderForever(t *testing.T) {
	l, nerr := glick.New(func(ctx context.Context, api, act string, handler glick.Plugin) (context.Context, glick.Plugin, error) {
		return ctx, nil, nil
	})
	if nerr != nil {
		t.Error(nerr)
	}
	var prototype int
	if err := l.RegAPI("abc", prototype,
		func() interface{} { var b bool; return interface{}(&b) },
		time.Second); err != nil {
		t.Error(err)
		return
	}
	if err := l.RegPlugin("abc", "forever", Forever, nil); err != nil {
		t.Error(err)
		return
	}
	ctx, can := context.WithTimeout(context.Background(), time.Millisecond)
	defer can()
	if _, err := l.Run(ctx, "abc", "forever", 1); err == nil {
		t.Error("overloader should have errored")
		return
	}
}
